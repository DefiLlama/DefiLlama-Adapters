const { ethers } = require('ethers')

const HUB = '0x120dbCDd58Bb787309573e29159fE6D37A1983F6'
// Uniswap v4 StateView on Base, https://docs.uniswap.org/contracts/v4/deployments
const STATE_VIEW = '0xA3c0c9b65baD0b08107Aa264b0f3dB444b867A71'

const ABI = {
  ventureById:
    'function ventureById(uint256) view returns (tuple(uint256 id, address venture, string name, uint256 createdAt))',
  ventureLiquidityVault: 'function ventureLiquidityVault(address) view returns (address)',
  spotProtocolFeeCutBps: 'function spotProtocolFeeCutBps() view returns (uint16)',
  totalAssets: 'function totalAssets() view returns (uint256 ventureAssets, uint256 moneyAssets)',
  shareBalance: 'function shareBalance(address) view returns (uint256)',
  getPoolKey:
    'function getPoolKey() view returns ((address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks))',
  getPositionInfo:
    'function getPositionInfo(bytes32 poolId, address owner, int24 tickLower, int24 tickUpper, bytes32 salt) view returns (uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128)',
  getFeeGrowthInside:
    'function getFeeGrowthInside(bytes32 poolId, int24 tickLower, int24 tickUpper) view returns (uint256 feeGrowthInside0X128, uint256 feeGrowthInside1X128)',
  activeMarketByVenture: 'function activeMarketByVenture(uint256) view returns (uint256)',
  marketSettled: 'function marketSettled(uint256) view returns (bool)',
  marketSettlementState:
    'function marketSettlementState(uint256) view returns (uint256 realVenture, uint256 realMoney, uint256 lpTokenId, uint256 ventureRemoved, uint256 moneyRemoved, uint128 liquidityRemoved)',
}

const Q128 = 2n ** 128n
const MAX_BPS = 10000n

const isSet = a => a && a !== ethers.ZeroAddress
const zero = () => ({ venture: 0n, money: 0n })

// The harness and the server build a fresh api per export key, so without this
// the vault reads repeat for tvl and ownTokens at the same block.
const memo = new Map()
function once(api, key, fn) {
  if (api.block === undefined) return fn()
  const k = `${api.chain}:${api.block}:${key}`
  if (!memo.has(k)) {
    if (memo.size >= 64) memo.delete(memo.keys().next().value)
    memo.set(k, fn().catch(e => { memo.delete(k); throw e }))
  }
  return memo.get(k)
}

/**
 * One venture at the block being read, or null before the hub created it.
 * `ventureById` is a plain mapping read, so an unknown id returns a zero struct
 * rather than reverting.
 */
async function resolveVenture(api, id) {
  const info = await api.call({ target: HUB, abi: ABI.ventureById, params: [id] })
  if (!isSet(info.venture)) return null
  const [token, moneyToken, vault, marketCore] = await api.batchCall([
    { target: info.venture, abi: 'address:token' },
    { target: info.venture, abi: 'address:moneyToken' },
    { target: HUB, abi: ABI.ventureLiquidityVault, params: [info.venture] },
    { target: HUB, abi: 'address:umiaMarketCore' },
  ])
  return {
    id,
    treasury: info.venture,
    token: token.toLowerCase(),
    moneyToken: moneyToken.toLowerCase(),
    vault: isSet(vault) ? vault : null,
    marketCore: isSet(marketCore) ? marketCore : null,
  }
}

/**
 * Both legs of the vault's position: `totalAssets()`, which covers the Uniswap v4
 * pool reserves, idle balance and any amount on loan to a live decision market,
 * plus the vault's share of swap fees the pool has not paid out yet.
 *
 * v4 keeps earned fees in the position's `feeGrowthInside` accumulator until
 * something pokes the position. Only the LP share counts: a poke skims the
 * protocol cut straight to the fee recipient, so that part is revenue in transit
 * rather than vault value. The vault skips the skim when no recipient is set.
 */
async function vaultAssets(api, v) {
  const [assets, poolKey, tickLower, tickUpper, cutBps, recipient] = await api.batchCall([
    { target: v.vault, abi: ABI.totalAssets },
    { target: v.vault, abi: ABI.getPoolKey },
    { target: v.vault, abi: 'int24:tickLower' },
    { target: v.vault, abi: 'int24:tickUpper' },
    { target: HUB, abi: ABI.spotProtocolFeeCutBps },
    { target: HUB, abi: 'address:protocolFeeRecipient' },
  ])

  // PoolIdLibrary.toId() hashes the five 32-byte PoolKey slots; the vault caches
  // the result in an immutable with no getter.
  const poolId = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ['address', 'address', 'uint24', 'int24', 'address'],
      [poolKey.currency0, poolKey.currency1, poolKey.fee, poolKey.tickSpacing, poolKey.hooks]
    )
  )
  const [position, growth] = await api.batchCall([
    {
      target: STATE_VIEW,
      abi: ABI.getPositionInfo,
      params: [poolId, v.vault, tickLower, tickUpper, ethers.ZeroHash],
    },
    { target: STATE_VIEW, abi: ABI.getFeeGrowthInside, params: [poolId, tickLower, tickUpper] },
  ])

  const liquidity = BigInt(position.liquidity)
  const cut = isSet(recipient) ? BigInt(cutBps) : 0n
  // v4 accumulates fee growth with wrapping arithmetic
  const lpShare = (last, now) =>
    ((BigInt.asUintN(256, BigInt(now) - BigInt(last)) * liquidity) / Q128) * (MAX_BPS - cut) / MAX_BPS
  const owed0 = lpShare(position.feeGrowthInside0LastX128, growth.feeGrowthInside0X128)
  const owed1 = lpShare(position.feeGrowthInside1LastX128, growth.feeGrowthInside1X128)
  const moneyIsCurrency0 = poolKey.currency0.toLowerCase() === v.moneyToken
  return {
    venture: BigInt(assets.ventureAssets) + (moneyIsCurrency0 ? owed1 : owed0),
    money: BigInt(assets.moneyAssets) + (moneyIsCurrency0 ? owed0 : owed1),
  }
}

/**
 * Real tokens users have escrowed in the venture's live decision market through
 * `split`. The market's real balances also carry the seed it pulled from the
 * vault, which `totalAssets()` still counts as on loan, so only the difference
 * above the pulled amounts is new. `merge` can draw the balance below the seed,
 * and the signed difference is then exactly what the vault's figure overstates.
 * A settled market stays the venture's newest until the next opens and its
 * balances never decrement, so it is skipped; tokens winners have not yet
 * claimed from it are not counted.
 */
async function marketEscrow(api, v) {
  if (!v.marketCore) return zero()
  const marketId = await api.call({ target: v.marketCore, abi: ABI.activeMarketByVenture, params: [v.id] })
  if (!BigInt(marketId)) return zero()
  const [settled, s] = await api.batchCall([
    { target: v.marketCore, abi: ABI.marketSettled, params: [marketId] },
    { target: v.marketCore, abi: ABI.marketSettlementState, params: [marketId] },
  ])
  if (settled) return zero()
  return {
    venture: BigInt(s.realVenture) - BigInt(s.ventureRemoved),
    money: BigInt(s.realMoney) - BigInt(s.moneyRemoved),
  }
}

function ventureTvl(id) {
  return async api => {
    const v = await once(api, `venture:${id}`, () => resolveVenture(api, id))
    if (!v?.vault) return
    const [assets, escrow] = await Promise.all([once(api, `vault:${id}`, () => vaultAssets(api, v)), marketEscrow(api, v)])
    api.add(v.moneyToken, assets.money + escrow.money)
    api.add(v.token, assets.venture + escrow.venture)
  }
}

/** One side of the treasury: the token it holds directly plus its pro-rata slice of the vault, by share balance. */
function treasuryLeg(id, tokenKey, sideKey) {
  return async api => {
    const v = await once(api, `venture:${id}`, () => resolveVenture(api, id))
    if (!v) return
    await api.sumTokens({ tokens: [v[tokenKey]], owners: [v.treasury] })
    if (!v.vault) return
    const [shares, totalShares, assets] = await Promise.all([
      api.call({ target: v.vault, abi: ABI.shareBalance, params: [v.treasury] }),
      api.call({ target: v.vault, abi: 'uint256:totalShares' }),
      once(api, `vault:${id}`, () => vaultAssets(api, v)),
    ])
    if (BigInt(totalShares)) api.add(v[tokenKey], (assets[sideKey] * BigInt(shares)) / BigInt(totalShares))
  }
}

/**
 * A venture's whole TVL module, so a new venture is one line naming its id and
 * the day its spot pool went live.
 */
function venture(id, opts = {}) {
  return {
    methodology:
      "Value of the tokens locked in one venture launched on Umia, from the day its spot pool goes live: both sides of the venture's SpotLiquidityVault position through totalAssets() -- Uniswap v4 pool reserves, idle balance and any amount on loan to a live decision market -- plus the vault's LP share of swap fees the pool has not paid out yet, plus the real tokens users have escrowed in the venture's live decision market. Bids escrowed during the launch auction are not counted: they are a raise in progress rather than liquidity, and they become pool liquidity or treasury once it settles. Tokens winners have not yet claimed from a settled decision market are not counted. The vault is the pool's only permitted liquidity operator by design, so it holds all canonical liquidity.",
    // The vault's position sits inside Uniswap v4's PoolManager, which the
    // Uniswap adapter already counts.
    doublecounted: true,
    ...opts,
    base: { tvl: ventureTvl(id) },
  }
}

/** A venture's treasury module, the same one line. */
function treasury(id, opts = {}) {
  return {
    methodology:
      "The venture treasury's holdings: raised capital in the venture's money token as treasury value, and the venture's own token reported separately as own tokens. The treasury also holds the shares of the venture's SpotLiquidityVault, so its pro-rata slice of the vault's position is included, the money side as treasury value and the venture-token side as own tokens.",
    ...opts,
    base: {
      tvl: treasuryLeg(id, 'moneyToken', 'money'),
      ownTokens: treasuryLeg(id, 'token', 'venture'),
    },
  }
}

module.exports = { venture, treasury }

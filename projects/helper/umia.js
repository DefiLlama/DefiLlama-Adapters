const { ethers } = require('ethers')
const { sumTokens2 } = require('./unwrapLPs')
const { nullAddress } = require('./tokenMapping')

const HUB = '0x120dbCDd58Bb787309573e29159fE6D37A1983F6'
const MARKET_CORE = '0x55975E430Cc54C63dff03B1E6d27Be574Ce229F6'
// Uniswap v4 lens on Base, for fees a pool still owes the vault
const STATE_VIEW = '0xA3c0c9b65baD0b08107Aa264b0f3dB444b867A71'

const ABI = {
  ventureById:
    'function ventureById(uint256) view returns (tuple(uint256 id, address venture, string name, uint256 createdAt))',
  ventureTokenById: 'function ventureTokenById(uint256) view returns (address)',
  ventureMoneyTokenById: 'function ventureMoneyTokenById(uint256) view returns (address)',
  ventureLiquidityVault: 'function ventureLiquidityVault(address) view returns (address)',
  totalAssets: 'function totalAssets() view returns (uint256 ventureAssets, uint256 moneyAssets)',
  shareBalance: 'function shareBalance(address) view returns (uint256)',
  activeMarketByVenture: 'function activeMarketByVenture(uint256) view returns (uint256)',
  marketSettled: 'function marketSettled(uint256) view returns (bool)',
  marketSettlementState:
    'function marketSettlementState(uint256) view returns (uint256 realVenture, uint256 realMoney, uint256 lpTokenId, uint256 ventureRemoved, uint256 moneyRemoved, uint128 liquidityRemoved)',
  getPoolKey:
    'function getPoolKey() view returns ((address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks))',
  getPositionInfo:
    'function getPositionInfo(bytes32 poolId, address owner, int24 tickLower, int24 tickUpper, bytes32 salt) view returns (uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128)',
  getFeeGrowthInside:
    'function getFeeGrowthInside(bytes32 poolId, int24 tickLower, int24 tickUpper) view returns (uint256 feeGrowthInside0X128, uint256 feeGrowthInside1X128)',
  spotProtocolFeeCutBps: 'function spotProtocolFeeCutBps() view returns (uint16)',
}

const Q128 = 2n ** 128n
const UINT256 = 2n ** 256n
const MAX_BPS = 10000n
const ZERO_SALT = `0x${'00'.repeat(32)}`
const NONE = { venture: 0n, money: 0n }

const isSet = a => a && a !== nullAddress

/**
 * One venture at the block being read, or null if the hub has not created it yet:
 * DefiLlama backfills dates before the venture existed, and the hub reverts on
 * unknown ids.
 */
async function resolveVenture(api, id) {
  const count = Number(await api.call({ target: HUB, abi: 'uint256:ventureCount' }))
  if (id > count) return null
  const [info, token, moneyToken] = await Promise.all([
    api.call({ target: HUB, abi: ABI.ventureById, params: [id] }),
    api.call({ target: HUB, abi: ABI.ventureTokenById, params: [id] }),
    api.call({ target: HUB, abi: ABI.ventureMoneyTokenById, params: [id] }),
  ])
  const vault = await api.call({ target: HUB, abi: ABI.ventureLiquidityVault, params: [info.venture] })
  return { id, treasury: info.venture, token, moneyToken, vault: isSet(vault) ? vault : null }
}

/**
 * Launch currency held by the venture's launch contract and its clearing auction:
 * the escrowed bids while the auction runs, then whatever change is still owed to
 * bidders who have not exited. Tokens held by the auction are unsold inventory
 * and unclaimed fills mixed together, so they are not counted.
 */
async function addLaunchEscrow(api, v) {
  const lbp = await api.call({ target: v.treasury, abi: 'address:lbp', permitFailure: true })
  if (!isSet(lbp)) return
  const [currency, auction] = await Promise.all([
    api.call({ target: lbp, abi: 'address:currency', permitFailure: true }),
    api.call({ target: lbp, abi: 'address:initializer', permitFailure: true }),
  ])
  if (!isSet(currency)) return
  const owners = isSet(auction) ? [lbp, auction] : [lbp]
  await sumTokens2({ api, tokens: [currency], owners })
}

/**
 * Both legs of the vault's position: `totalAssets()`, which covers the Uniswap v4
 * pool reserves, idle balance and any amount on loan to a live decision market,
 * plus the vault's LP share of swap fees the pool has not paid out yet.
 */
async function vaultAssets(api, v) {
  const { ventureAssets, moneyAssets } = await api.call({ target: v.vault, abi: ABI.totalAssets })
  const fees = await uncollectedFees(api, v)
  return { venture: BigInt(ventureAssets) + fees.venture, money: BigInt(moneyAssets) + fees.money }
}

/**
 * Uniswap v4 holds earned fees in the position's `feeGrowthInside` accumulator
 * until something pokes the position, and only then do they reach the vault's
 * balance. Only the LP share counts: a poke skims the protocol cut straight to the
 * fee recipient, so that part is revenue in transit rather than vault value.
 * Reads as zero when the lens cannot be reached, so the venture still reports
 * what `totalAssets()` returned.
 */
async function uncollectedFees(api, v) {
  const [poolKey, tickLower, tickUpper] = await Promise.all([
    api.call({ target: v.vault, abi: ABI.getPoolKey, permitFailure: true }),
    api.call({ target: v.vault, abi: 'int24:tickLower', permitFailure: true }),
    api.call({ target: v.vault, abi: 'int24:tickUpper', permitFailure: true }),
  ])
  if (!poolKey || tickLower === null || tickUpper === null) return NONE

  // PoolIdLibrary.toId() hashes the five 32-byte PoolKey slots; the vault caches
  // the result in an immutable with no getter.
  const poolId = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ['address', 'address', 'uint24', 'int24', 'address'],
      [poolKey.currency0, poolKey.currency1, poolKey.fee, poolKey.tickSpacing, poolKey.hooks]
    )
  )

  const [position, growth, cutBps] = await Promise.all([
    api.call({
      target: STATE_VIEW,
      abi: ABI.getPositionInfo,
      params: [poolId, v.vault, tickLower, tickUpper, ZERO_SALT],
      permitFailure: true,
    }),
    api.call({ target: STATE_VIEW, abi: ABI.getFeeGrowthInside, params: [poolId, tickLower, tickUpper], permitFailure: true }),
    api.call({ target: HUB, abi: ABI.spotProtocolFeeCutBps, permitFailure: true }),
  ])
  if (!position || !growth || cutBps === null) return NONE

  const liquidity = BigInt(position.liquidity)
  if (!liquidity) return NONE

  // v4 accumulates fee growth with wrapping arithmetic, so the delta is mod 2^256
  const lpShare = (last, now) =>
    ((((BigInt(now) - BigInt(last) + UINT256) % UINT256) * liquidity) / Q128) * (MAX_BPS - BigInt(cutBps)) / MAX_BPS
  const owed0 = lpShare(position.feeGrowthInside0LastX128, growth.feeGrowthInside0X128)
  const owed1 = lpShare(position.feeGrowthInside1LastX128, growth.feeGrowthInside1X128)
  const moneyIsCurrency0 = poolKey.currency0.toLowerCase() === v.moneyToken.toLowerCase()
  return moneyIsCurrency0 ? { money: owed0, venture: owed1 } : { money: owed1, venture: owed0 }
}

/**
 * Real tokens users have escrowed in the venture's live decision market through
 * `split`. The real balances also carry the seed the market pulled from the vault
 * at creation, which `totalAssets()` still counts as on loan, so only the part
 * above the removed amounts is new; `merge` can draw against the seed, so the
 * difference is clamped at zero. A settled market stays the venture's newest until
 * the next one opens and its balances never decrement, so it is skipped.
 */
async function marketEscrow(api, v) {
  const marketId = await api.call({ target: MARKET_CORE, abi: ABI.activeMarketByVenture, params: [v.id] })
  if (!marketId || marketId === '0') return NONE
  if (await api.call({ target: MARKET_CORE, abi: ABI.marketSettled, params: [marketId] })) return NONE
  const s = await api.call({ target: MARKET_CORE, abi: ABI.marketSettlementState, params: [marketId] })
  const above = (real, removed) => {
    const d = BigInt(real) - BigInt(removed)
    return d > 0n ? d : 0n
  }
  return { venture: above(s.realVenture, s.ventureRemoved), money: above(s.realMoney, s.moneyRemoved) }
}

function ventureTvl(id) {
  return async api => {
    const v = await resolveVenture(api, id)
    if (!v || !isSet(v.moneyToken)) return api.getBalances()
    await addLaunchEscrow(api, v)
    if (v.vault) {
      const assets = await vaultAssets(api, v)
      const escrow = await marketEscrow(api, v)
      api.add(v.moneyToken, (assets.money + escrow.money).toString())
      if (isSet(v.token)) api.add(v.token, (assets.venture + escrow.venture).toString())
    }
    return api.getBalances()
  }
}

/** The treasury's pro-rata slice of the vault's position, by share balance. */
async function treasuryVaultSlice(api, v) {
  if (!v.vault) return NONE
  const [shares, totalShares] = await Promise.all([
    api.call({ target: v.vault, abi: ABI.shareBalance, params: [v.treasury] }),
    api.call({ target: v.vault, abi: 'uint256:totalShares' }),
  ])
  if (!BigInt(shares) || !BigInt(totalShares)) return NONE
  const assets = await vaultAssets(api, v)
  return {
    venture: (assets.venture * BigInt(shares)) / BigInt(totalShares),
    money: (assets.money * BigInt(shares)) / BigInt(totalShares),
  }
}

function treasuryTvl(id) {
  return async api => {
    const v = await resolveVenture(api, id)
    if (!v || !isSet(v.moneyToken)) return api.getBalances()
    await sumTokens2({ api, tokens: [v.moneyToken], owners: [v.treasury] })
    api.add(v.moneyToken, (await treasuryVaultSlice(api, v)).money.toString())
    return api.getBalances()
  }
}

function treasuryOwnTokens(id) {
  return async api => {
    const v = await resolveVenture(api, id)
    if (!v || !isSet(v.token)) return api.getBalances()
    await sumTokens2({ api, tokens: [v.token], owners: [v.treasury] })
    api.add(v.token, (await treasuryVaultSlice(api, v)).venture.toString())
    return api.getBalances()
  }
}

/**
 * A venture's whole TVL module, so a new venture is one line naming its id and
 * the date its auction opened.
 */
function venture(id, { start, hallmarks } = {}) {
  return {
    methodology:
      "Value of the tokens locked in one venture launched on Umia. While the launch runs, the bids escrowed in its launch contract and Uniswap Continuous Clearing Auction, in the launch currency. Once it settles into a spot pool, both sides of the venture's SpotLiquidityVault position through totalAssets() -- Uniswap v4 pool reserves, idle balance and any amount on loan to a live decision market -- plus the vault's LP share of swap fees the pool has not paid out yet, plus the real tokens users have escrowed in the venture's live decision market. Tokens held by the auction itself are not counted. The vault is the pool's only permitted liquidity operator by design, so it holds all canonical liquidity.",
    start,
    hallmarks,
    base: { tvl: ventureTvl(id) },
  }
}

/** A venture's treasury module, the same one line. */
function treasury(id, { start } = {}) {
  return {
    methodology:
      "The venture treasury's holdings: raised capital in the venture's money token as treasury value, and the venture's own token reported separately as own tokens. The treasury also holds the shares of the venture's SpotLiquidityVault, so its pro-rata slice of the vault's position is included, the money side as treasury value and the venture-token side as own tokens.",
    start,
    base: { tvl: treasuryTvl(id), ownTokens: treasuryOwnTokens(id) },
  }
}

module.exports = { HUB, MARKET_CORE, venture, treasury }

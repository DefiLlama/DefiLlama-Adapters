const { ethers } = require('ethers')
const { sumTokens2 } = require('./unwrapLPs')
const { nullAddress } = require('./tokenMapping')

const HUB = '0x120dbCDd58Bb787309573e29159fE6D37A1983F6'
const MARKET_CORE = '0x55975E430Cc54C63dff03B1E6d27Be574Ce229F6'
const MARKET_STAKE = '0x1819093Ec7376384A659e1c4976CDbc52F5564b9'
// Uniswap v4 lens on Base, for fees a pool still owes the vault
const STATE_VIEW = '0xA3c0c9b65baD0b08107Aa264b0f3dB444b867A71'

// Ventures 1-6 are test deployments that predate the first real launch.
const FIRST_REAL_VENTURE_ID = 7
// Venture 7 is Umia's own venture: it is the protocol fee recipient, so its
// treasury is reported on the parent rather than with the launched ventures.
const PROTOCOL_VENTURE_ID = 7

const VENTURE_BY_ID =
  'function ventureById(uint256) view returns (tuple(uint256 id, address venture, string name, uint256 createdAt))'
const VENTURE_TOKEN_BY_ID = 'function ventureTokenById(uint256) view returns (address)'
const VENTURE_MONEY_TOKEN_BY_ID = 'function ventureMoneyTokenById(uint256) view returns (address)'
const VENTURE_VAULT = 'function ventureLiquidityVault(address) view returns (address)'
const TOTAL_ASSETS = 'function totalAssets() view returns (uint256 ventureAssets, uint256 moneyAssets)'
const ACTIVE_MARKET_BY_VENTURE = 'function activeMarketByVenture(uint256) view returns (uint256)'
const POOL_KEY =
  'function getPoolKey() view returns ((address currency0, address currency1, uint24 fee, int24 tickSpacing, address hooks))'
const POSITION_INFO =
  'function getPositionInfo(bytes32 poolId, address owner, int24 tickLower, int24 tickUpper, bytes32 salt) view returns (uint128 liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128)'
const FEE_GROWTH_INSIDE =
  'function getFeeGrowthInside(bytes32 poolId, int24 tickLower, int24 tickUpper) view returns (uint256 feeGrowthInside0X128, uint256 feeGrowthInside1X128)'
const SPOT_PROTOCOL_CUT_BPS = 'function spotProtocolFeeCutBps() view returns (uint16)'

const Q128 = 2n ** 128n
const UINT256 = 2n ** 256n
const MAX_BPS = 10000n
const ZERO_SALT = `0x${'00'.repeat(32)}`
const MARKET_SETTLEMENT_STATE =
  'function marketSettlementState(uint256) view returns (uint256 realVenture, uint256 realMoney, uint256 lpTokenId, uint256 ventureRemoved, uint256 moneyRemoved, uint128 liquidityRemoved)'

const isSet = i => i && i !== nullAddress

/**
 * Venture ids are 1-based and never reused, so slicing off the leading test
 * deployments by id needs no maintenance as new ventures are created.
 */
async function ventureIds(api, { from = FIRST_REAL_VENTURE_ID, only } = {}) {
  if (only !== undefined) return [only]
  const count = Number(await api.call({ target: HUB, abi: 'uint256:ventureCount' }))
  const ids = []
  for (let id = from; id <= count; id++) ids.push(id)
  return ids
}

async function resolveVentures(api, ids) {
  if (!ids.length) return { ids, ventures: [], tokens: [], moneyTokens: [], vaults: [] }
  const infos = await api.multiCall({ target: HUB, abi: VENTURE_BY_ID, calls: ids })
  const ventures = infos.map(i => i.venture)
  const [tokens, moneyTokens, vaults] = await Promise.all([
    api.multiCall({ target: HUB, abi: VENTURE_TOKEN_BY_ID, calls: ids }),
    api.multiCall({ target: HUB, abi: VENTURE_MONEY_TOKEN_BY_ID, calls: ids }),
    api.multiCall({ target: HUB, abi: VENTURE_VAULT, calls: ventures }),
  ])
  return { ids, ventures, tokens, moneyTokens, vaults }
}

/**
 * Bids escrowed in every launch that has not settled yet, in the launch currency.
 *
 * Tokens on sale are the venture's own and are not counted, the same way a
 * protocol's own token is kept out of TVL elsewhere.
 */
async function launchpadTvl(api) {
  const ids = await ventureIds(api)
  const { ventures } = await resolveVentures(api, ids)
  if (!ventures.length) return api.getBalances()

  const lbps = await api.multiCall({ abi: 'address:lbp', calls: ventures, permitFailure: true })
  const liveLbps = lbps.filter(isSet)
  if (!liveLbps.length) return api.getBalances()

  const [currencies, auctions] = await Promise.all([
    api.multiCall({ abi: 'address:currency', calls: liveLbps }),
    api.multiCall({ abi: 'address:initializer', calls: liveLbps, permitFailure: true }),
  ])

  const tokensAndOwners = []
  liveLbps.forEach((lbp, i) => {
    tokensAndOwners.push([currencies[i], lbp])
    if (isSet(auctions[i])) tokensAndOwners.push([currencies[i], auctions[i]])
  })

  return sumTokens2({ api, tokensAndOwners, blacklistedOwners: [nullAddress] })
}

/**
 * Canonical spot liquidity plus live decision-market escrow for one venture,
 * counted in the venture's money token only.
 *
 * `totalAssets()` covers the vault's Uniswap v4 pool reserves, its idle balance
 * and the amount on loan to a live decision market, so a pool-only reading would
 * drop the loaned share for the length of each market. The market's own escrow
 * is the real money users deposited through `split`, which is tracked per market
 * and is disjoint from the vault's loan.
 */
function ventureTvl(id) {
  return async api => {
    const { moneyTokens, vaults } = await resolveVentures(api, [id])
    const [moneyToken] = moneyTokens
    const [vault] = vaults
    if (!isSet(vault)) return api.getBalances()

    const { moneyAssets } = await api.call({ target: vault, abi: TOTAL_ASSETS })
    api.add(moneyToken, moneyAssets)
    api.add(moneyToken, await uncollectedVaultFees(api, vault, moneyToken))

    const marketId = await api.call({ target: MARKET_CORE, abi: ACTIVE_MARKET_BY_VENTURE, params: [id] })
    if (marketId && marketId !== '0') {
      const { realMoney } = await api.call({ target: MARKET_CORE, abi: MARKET_SETTLEMENT_STATE, params: [marketId] })
      api.add(moneyToken, realMoney)
    }

    return api.getBalances()
  }
}

/**
 * The vault's own share of swap fees the pool still owes it.
 *
 * Uniswap v4 holds earned fees in the position's `feeGrowthInside` accumulator
 * until something pokes the position, and only then does the vault's balance
 * (and so `totalAssets()`) see them. Left out, TVL would drift further below the
 * vault's real claim the longer nobody pokes, then jump. Only the LP share is
 * counted: crystallizing immediately skims the protocol's cut to the fee
 * recipient, so that part is revenue in transit rather than value the vault
 * holds, and counting it would make TVL fall when the skim happens.
 */
async function uncollectedVaultFees(api, vault, moneyToken) {
  const [poolKey, tickLower, tickUpper] = await Promise.all([
    api.call({ target: vault, abi: POOL_KEY }),
    api.call({ target: vault, abi: 'int24:tickLower' }),
    api.call({ target: vault, abi: 'int24:tickUpper' }),
  ])
  // PoolIdLibrary.toId() hashes the five 32-byte PoolKey slots; the vault caches
  // the result in an immutable with no getter.
  const poolId = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(
      ['address', 'address', 'uint24', 'int24', 'address'],
      [poolKey.currency0, poolKey.currency1, poolKey.fee, poolKey.tickSpacing, poolKey.hooks]
    )
  )

  const [position, current, cutBps] = await Promise.all([
    api.call({ target: STATE_VIEW, abi: POSITION_INFO, params: [poolId, vault, tickLower, tickUpper, ZERO_SALT] }),
    api.call({ target: STATE_VIEW, abi: FEE_GROWTH_INSIDE, params: [poolId, tickLower, tickUpper] }),
    api.call({ target: HUB, abi: SPOT_PROTOCOL_CUT_BPS }),
  ])

  const liquidity = BigInt(position.liquidity)
  if (!liquidity) return 0

  const moneyIsCurrency0 = poolKey.currency0.toLowerCase() === moneyToken.toLowerCase()
  const last = BigInt(moneyIsCurrency0 ? position.feeGrowthInside0LastX128 : position.feeGrowthInside1LastX128)
  const now = BigInt(moneyIsCurrency0 ? current.feeGrowthInside0X128 : current.feeGrowthInside1X128)
  // v4 accumulates fee growth with wrapping arithmetic, so the delta is mod 2^256
  const owed = ((now - last + UINT256) % UINT256) * liquidity / Q128
  return (owed * (MAX_BPS - BigInt(cutBps))) / MAX_BPS
}

/** Venture tokens staked to open a decision market. Own-token, so never `tvl`. */
function ventureStaking(id) {
  return async api => {
    const { tokens } = await resolveVentures(api, [id])
    return sumTokens2({ api, tokens, owners: [MARKET_STAKE] })
  }
}

/**
 * A venture's whole TVL module, so a new venture is one line naming its id and
 * the date its spot pool went live.
 */
function venture(id, { start, hallmarks } = {}) {
  return {
    methodology:
      "Canonical spot liquidity held by the venture's SpotLiquidityVault -- its Uniswap v4 pool reserves, idle balances and any amount on loan to a live decision market -- plus the vault's own share of swap fees the pool has not paid out yet, plus the real money users have escrowed in the venture's live decision market through `split`. Counted in the venture's money token only: the venture token is the platform's own, which DefiLlama keeps out of TVL. The vault is the pool's only permitted liquidity operator by design, so it holds 100% of canonical liquidity. Staking is the venture token staked to open a decision market.",
    start,
    hallmarks,
    base: {
      tvl: ventureTvl(id),
      staking: ventureStaking(id),
    },
  }
}

/**
 * Raised capital held by venture treasuries, in each venture's money token.
 *
 * No overlap with the launch adapter: auction bids are escrowed in the launch
 * contract pre-settlement and only reach the treasury afterwards.
 */
function treasuryTvl({ from, only } = {}) {
  return async api => {
    const ids = await ventureIds(api, { from, only })
    const { ventures, moneyTokens } = await resolveVentures(api, ids)
    if (!ventures.length) return api.getBalances()
    return api.sumTokens({ tokensAndOwners2: [moneyTokens, ventures] })
  }
}

/** Each venture's own token held by its treasury, reported separately from TVL. */
function treasuryOwnTokens({ from, only } = {}) {
  return async api => {
    const ids = await ventureIds(api, { from, only })
    const { ventures, tokens } = await resolveVentures(api, ids)
    if (!ventures.length) return api.getBalances()
    return api.sumTokens({ tokensAndOwners2: [tokens, ventures] })
  }
}

module.exports = {
  HUB,
  MARKET_CORE,
  MARKET_STAKE,
  FIRST_REAL_VENTURE_ID,
  PROTOCOL_VENTURE_ID,
  launchpadTvl,
  venture,
  ventureTvl,
  ventureStaking,
  treasuryTvl,
  treasuryOwnTokens,
}

const { sumTokens2 } = require('../helper/unwrapLPs')
const { nullAddress } = require('../helper/tokenMapping')

const HUB = '0x120dbCDd58Bb787309573e29159fE6D37A1983F6'
// Ventures 1-6 are test deployments that predate the first real launch.
const FIRST_REAL_VENTURE_ID = 7

const VENTURE_BY_ID =
  'function ventureById(uint256) view returns (tuple(uint256 id, address venture, string name, uint256 createdAt))'
const VENTURE_VAULT = 'function ventureLiquidityVault(address) view returns (address)'
const TOTAL_ASSETS = 'function totalAssets() view returns (uint256 ventureAssets, uint256 moneyAssets)'
const MARKET_STATE =
  'function marketSettlementState(uint256) view returns (uint256 realVenture, uint256 realMoney, uint256 lpTokenId, uint256 ventureRemoved, uint256 moneyRemoved, uint128 liquidityRemoved)'

/**
 * Enumerates real venture treasuries from the hub.
 *
 * Venture ids are 1-based and never reused, so slicing off the leading test
 * deployments by id needs no maintenance as new ventures are created.
 *
 */
async function getVentures(api) {
  return api.fetchList({ lengthAbi: 'ventureCount', itemAbi: VENTURE_BY_ID, target: HUB, field: 'venture', startFrom: FIRST_REAL_VENTURE_ID, startFromOne: true, })
}

/**
 * Sums escrowed launch bids and canonical spot liquidity across all live ventures.
 *
 * Spot liquidity is read from each venture's SpotLiquidityVault rather than from the
 * Uniswap v4 pool directly: `totalAssets()` also covers idle vault balances and amounts
 * on loan to live decision markets, which a pool-only reading would drop for the
 * duration of each market.
 *
 */
async function tvl(api) {
  const ventures = await getVentures(api)
  if (!ventures.length) return api.getBalances()

  const lbps = await api.multiCall({ abi: 'address:lbp', calls: ventures })
  const auctions = await api.multiCall({ abi: 'address:initializer', calls: lbps })
  const currencies = await api.multiCall({ abi: 'address:currency', calls: lbps })

  const tokensAndOwners = []
  lbps.forEach((lbp, i) => {
    tokensAndOwners.push([currencies[i], auctions[i]])
    tokensAndOwners.push([currencies[i], lbp])
  })

  await sumTokens2({ api, tokensAndOwners, blacklistedOwners: [nullAddress] })

  const vaults = (await api.multiCall({ target: HUB, abi: VENTURE_VAULT, calls: ventures })).filter(v => v && v !== nullAddress)

  const assets = await api.multiCall({ abi: TOTAL_ASSETS, calls: vaults })
  const ventureTokens = await api.multiCall({ abi: 'address:ventureToken', calls: vaults })
  const moneyTokens = await api.multiCall({ abi: 'address:moneyToken', calls: vaults })

  api.add(ventureTokens, assets.map(a => a.ventureAssets))
  api.add(moneyTokens, assets.map(a => a.moneyAssets))

  await marketEscrow(api, ventures)
}

/**
 * Tokens users have escrowed in each venture's live decision market.
 *
 * A market's real balances also carry the seed it pulled from the vault, which
 * `totalAssets()` still counts as on loan, so only the signed difference above the
 * pulled amounts is added. Settled markets are skipped: their balances never
 * decrement and leave as winners claim.
 */
async function marketEscrow(api, ventures) {
  const marketCore = await api.call({ target: HUB, abi: 'address:umiaMarketCore' })
  if (marketCore === nullAddress) return

  const ids = ventures.map((_, i) => FIRST_REAL_VENTURE_ID + i)
  const marketIds = await api.multiCall({ target: marketCore, abi: 'function activeMarketByVenture(uint256) view returns (uint256)', calls: ids })
  const live = ids.map((id, i) => ({ id, venture: ventures[i], marketId: marketIds[i] })).filter(m => m.marketId !== '0')
  if (!live.length) return

  const settled = await api.multiCall({ target: marketCore, abi: 'function marketSettled(uint256) view returns (bool)', calls: live.map(m => m.marketId) })
  const open = live.filter((_, i) => !settled[i])
  if (!open.length) return

  const states = await api.multiCall({ target: marketCore, abi: MARKET_STATE, calls: open.map(m => m.marketId) })
  const tokens = await api.multiCall({ abi: 'address:token', calls: open.map(m => m.venture) })
  const moneyTokens = await api.multiCall({ abi: 'address:moneyToken', calls: open.map(m => m.venture) })

  states.forEach((s, i) => {
    api.add(tokens[i], BigInt(s.realVenture) - BigInt(s.ventureRemoved))
    api.add(moneyTokens[i], BigInt(s.realMoney) - BigInt(s.moneyRemoved))
  })
}

module.exports = {
  methodology:
    'Bids escrowed in each Umia launch (the launch contract and its Uniswap Continuous Clearing Auction, in the launch currency), plus the canonical spot liquidity held by each venture SpotLiquidityVault -- its Uniswap v4 pool reserves, idle balances, and amounts on loan to live decision markets -- plus the tokens users have escrowed in each venture\'s live decision market. The vault is the pool\'s only permitted liquidity operator, so it holds 100% of canonical liquidity. Launches are enumerated from the Umia hub; venture treasuries are tracked separately as a treasury adapter.',
  // The vault positions sit inside Uniswap v4's PoolManager, which the uniswap-v4 adapter already counts.
  doublecounted: true,
  start: '2026-08-25',
  base: { tvl },
}

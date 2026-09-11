const { sumTokens2 } = require('../helper/unwrapLPs')
const { nullAddress } = require('../helper/tokenMapping')

const HUB = '0x120dbCDd58Bb787309573e29159fE6D37A1983F6'
// Ventures 1-6 are test deployments that predate the first real launch.
const FIRST_REAL_VENTURE_ID = 7

const VENTURE_BY_ID =
  'function ventureById(uint256) view returns (tuple(uint256 id, address venture, string name, uint256 createdAt))'
const VENTURE_VAULT = 'function ventureLiquidityVault(address) view returns (address)'
const TOTAL_ASSETS = 'function totalAssets() view returns (uint256 ventureAssets, uint256 moneyAssets)'

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

}

module.exports = {
  methodology:
    'Bids escrowed in each Umia launch (the launch contract and its Uniswap Continuous Clearing Auction, in the launch currency), plus the canonical spot liquidity held by each venture SpotLiquidityVault -- its Uniswap v4 pool reserves, idle balances, and amounts on loan to live decision markets. The vault is the pool\'s only permitted liquidity operator, so it holds 100% of canonical liquidity. Launches are enumerated from the Umia hub; venture treasuries are tracked separately as a treasury adapter.',
  start: '2026-08-25',
  base: { tvl },
}

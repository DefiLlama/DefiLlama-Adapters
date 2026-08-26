const { sumTokens2 } = require('../helper/unwrapLPs')
const { nullAddress } = require('../helper/tokenMapping')

const HUB = '0x120dbCDd58Bb787309573e29159fE6D37A1983F6'
// Ventures 1-6 are "Koi3 TEST" deployments that predate the first real launch.
const FIRST_REAL_VENTURE_ID = 7

const VENTURE_BY_ID =
  'function ventureById(uint256) view returns (tuple(uint256 id, address venture, string name, uint256 createdAt))'
const VENTURE_VAULT = 'function ventureLiquidityVault(address) view returns (address)'
const TOTAL_ASSETS = 'function totalAssets() view returns (uint256 ventureAssets, uint256 moneyAssets)'

async function getVentures(api) {
  const count = await api.call({ target: HUB, abi: 'uint256:ventureCount' })
  const ids = []
  for (let id = FIRST_REAL_VENTURE_ID; id <= +count; id++) ids.push(id)
  if (!ids.length) return []
  const infos = await api.multiCall({ target: HUB, abi: VENTURE_BY_ID, calls: ids })
  return infos.map(v => v.venture)
}

async function tvl(api) {
  const ventures = await getVentures(api)
  if (!ventures.length) return api.getBalances()

  // Bids escrowed in each live launch: the launch contract and its Continuous Clearing Auction.
  const lbps = await api.multiCall({ abi: 'address:lbp', calls: ventures })
  const [auctions, currencies] = await Promise.all([
    api.multiCall({ abi: 'address:initializer', calls: lbps }),
    api.multiCall({ abi: 'address:currency', calls: lbps }),
  ])
  const tokensAndOwners = []
  lbps.forEach((lbp, i) => {
    for (const owner of [lbp, auctions[i]])
      if (owner && owner !== nullAddress) tokensAndOwners.push([currencies[i], owner])
  })
  await sumTokens2({ api, tokensAndOwners })

  // Canonical spot liquidity. The venture's SpotLiquidityVault is the pool's only permitted LP,
  // and totalAssets() covers in-pool reserves, idle balances, and amounts currently on loan to
  // live decision markets -- so it stays correct across hook redeployments and market cycles.
  const vaults = (
    await api.multiCall({ target: HUB, abi: VENTURE_VAULT, calls: ventures })
  ).filter(v => v && v !== nullAddress)
  if (vaults.length) {
    const [assets, ventureTokens, moneyTokens] = await Promise.all([
      api.multiCall({ abi: TOTAL_ASSETS, calls: vaults }),
      api.multiCall({ abi: 'address:ventureToken', calls: vaults }),
      api.multiCall({ abi: 'address:moneyToken', calls: vaults }),
    ])
    vaults.forEach((_, i) => {
      api.add(ventureTokens[i], assets[i].ventureAssets)
      api.add(moneyTokens[i], assets[i].moneyAssets)
    })
  }

  return api.getBalances()
}

module.exports = {
  methodology:
    'Bids escrowed in each Umia launch (the launch contract and its Uniswap Continuous Clearing Auction, in the launch currency), plus the canonical spot liquidity held by each venture SpotLiquidityVault -- its Uniswap v4 pool reserves, idle balances, and amounts on loan to live decision markets. Launches are enumerated from the Umia hub; venture treasuries are tracked separately as a treasury adapter.',
  start: 1787694409,
  base: { tvl },
}

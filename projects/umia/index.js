const { sumTokens2 } = require('../helper/unwrapLPs')
const { nullAddress } = require('../helper/tokenMapping')
const { uniV4HookExport } = require('../helper/uniswapV4')

const HUB = '0x120dbCDd58Bb787309573e29159fE6D37A1983F6'
// Singleton Uniswap v4 hook: every Umia spot pool is registered on it at migration
const UMIA_HOOK = '0x752E82933B1629Cdf1A50F4D71F8D1C9Eb1C7A80'

async function getVentures(api) {
  const count = await api.call({ target: HUB, abi: 'uint256:ventureCount' })
  const ids = Array.from({ length: +count }, (_, i) => i + 1) // venture ids are 1-based
  return (await api.multiCall({
    target: HUB,
    abi: 'function ventureById(uint256) view returns (tuple(uint256 id, address venture, string name, uint256 createdAt))',
    calls: ids,
  })).map(v => v.venture)
}

async function tvl(api) {
  const ventures = await getVentures(api)
  const lbps = await api.multiCall({ abi: 'address:lbp', calls: ventures })
  const auctions = await api.multiCall({ abi: 'address:initializer', calls: lbps })
  const currencies = await api.multiCall({ abi: 'address:currency', calls: lbps })

  // bids escrowed in each live launch: the launch contract and its Continuous Clearing Auction
  const tokensAndOwners = []
  lbps.forEach((lbp, i) => {
    for (const owner of [lbp, auctions[i]])
      if (owner && owner !== nullAddress) tokensAndOwners.push([currencies[i], owner])
  })
  await sumTokens2({ api, tokensAndOwners })

  // protocol-owned spot liquidity: at migration each launch seeds a Uniswap v4 pool on the hook
  await uniV4HookExport({ hook: UMIA_HOOK })(api)
  return api.getBalances()
}

module.exports = {
  methodology:
    'Bids escrowed in each Umia launch (the launch contract and its Uniswap Continuous Clearing Auction, in the launch currency), plus the liquidity of the Uniswap v4 pools registered on the Umia hook, which each launch seeds at migration. Launches are enumerated from the Umia hub; treasuries are tracked separately as a treasury adapter.',
  base: { tvl },
}

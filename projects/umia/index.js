const { sumTokens2 } = require('../helper/unwrapLPs')
const { nullAddress } = require('../helper/tokenMapping')

const HUB = '0x120dbCDd58Bb787309573e29159fE6D37A1983F6'

async function tvl(api) {
  const count = await api.call({ target: HUB, abi: 'uint256:ventureCount' })
  const ids = Array.from({ length: +count }, (_, i) => i + 1) // venture ids are 1-based
  const ventures = (await api.multiCall({
    target: HUB,
    abi: 'function ventureById(uint256) view returns (tuple(uint256 id, address venture, string name, uint256 createdAt))',
    calls: ids,
  })).map(v => v.venture)
  const lbps = await api.multiCall({ abi: 'address:lbp', calls: ventures })
  const auctions = await api.multiCall({ abi: 'address:initializer', calls: lbps })
  const vaults = await api.multiCall({
    target: HUB,
    abi: 'function ventureLiquidityVault(address) view returns (address)',
    calls: ventures,
  })
  const currencies = await api.multiCall({ abi: 'address:currency', calls: lbps })

  const tokensAndOwners = []
  lbps.forEach((lbp, i) => {
    for (const owner of [lbp, auctions[i], vaults[i]])
      if (owner && owner !== nullAddress) tokensAndOwners.push([currencies[i], owner])
  })
  return sumTokens2({ api, tokensAndOwners })
}

module.exports = {
  methodology:
    'Money tokens (USDC) locked in Umia launches: escrowed bids held by each venture launch contract and its Uniswap Continuous Clearing Auction, plus the protocol-owned Uniswap v4 liquidity vault seeded at migration. Ventures are enumerated from the Umia hub.',
  base: { tvl },
}

const sdk = require("@defillama/sdk");
const { cachedGraphQuery } = require('../helper/cache')

const GRAPH_URLS = {
  ethereum: sdk.graph.modifyEndpoint('https://subgraph.satsuma-prod.com/a912521dd162/templedao/origami-mainnet/api'), // ethereum
  arbitrum: sdk.graph.modifyEndpoint('https://subgraph.satsuma-prod.com/a912521dd162/templedao/origami-arbitrum/api'), // arbitrum
}

module.exports = {
  doublecounted: true,
}

Object.keys(GRAPH_URLS).forEach(chain => {
  module.exports[chain] = { tvl }
})

async function tvl(api) {
  const { metrics: [{ investmentVaults }] } = await cachedGraphQuery('origami/' + api.chain, GRAPH_URLS[api.chain], '{ metrics { investmentVaults { id kinds } } }')

  const isLeveraged = vault => !!vault.kinds.find(v => v === 'Leverage')
  const levVaults = investmentVaults.filter(isLeveraged).map(v => v.id)
  const nonLevVaults = investmentVaults.filter(v => !isLeveraged(v)).map(v => v.id)

  let nonLevTokens = await api.multiCall({ abi: 'address:reserveToken', calls: nonLevVaults })
  nonLevTokens = await api.multiCall({ abi: 'address:baseToken', calls: nonLevTokens })
  const decimals = await api.multiCall({ abi: 'uint8:decimals', calls: nonLevVaults })
  const supplies = await api.multiCall({ abi: 'uint256:totalSupply', calls: nonLevVaults })
  const reserves = await api.multiCall({ abi: 'uint256:reservesPerShare', calls: nonLevVaults })
  const bals = supplies.map((supply, idx) => reserves[idx] * supply / 10 ** decimals[idx])
  api.add(nonLevTokens, bals)

  const levReserveTokens = await api.multiCall({ calls: levVaults, abi: 'address:reserveToken' })
  const assetsAndLiabilities = await api.multiCall({ abi: 'function assetsAndLiabilities() external view returns (uint256 assets,uint256 liabilities,uint256 ratio)', calls: levVaults })
  const levBals = assetsAndLiabilities.map(({ assets, liabilities }) => assets - liabilities)
  api.add(levReserveTokens, levBals)
}

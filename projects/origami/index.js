const sdk = require("@defillama/sdk");
const { cachedGraphQuery } = require('../helper/cache')

const GRAPH_URLS = {
  ethereum: sdk.graph.modifyEndpoint('https://subgraph.satsuma-prod.com/a912521dd162/templedao/origami-mainnet/api'), // ethereum
  arbitrum: sdk.graph.modifyEndpoint('https://subgraph.satsuma-prod.com/a912521dd162/templedao/origami-arbitrum/api'), // arbitrum
}

const osUSDS = '0x0f90a6962e86b5587b4c11ba2b9697dc3ba84800'

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

  const [decimals, supplies, reserves, rawNonLevTokens] = await Promise.all([
    api.multiCall({ abi: 'uint8:decimals', calls: nonLevVaults, permitFailure: true }),
    api.multiCall({ abi: 'uint256:totalSupply', calls: nonLevVaults, permitFailure: true }),
    api.multiCall({ abi: 'uint256:reservesPerShare', calls: nonLevVaults, permitFailure: true }),
    api.multiCall({ abi: 'address:reserveToken', calls: nonLevVaults, permitFailure: true })
  ])

  await Promise.all(nonLevVaults.map(async (_vault, i) => {
    const decimal = decimals[i]
    const supply = supplies[i]
    const reserve = reserves[i]
    const rawNonLevToken = rawNonLevTokens[i]
    if (!decimals || !supply || !reserve || !rawNonLevToken) return
    const nonLevToken = await api.call({ abi: 'address:baseToken', target: rawNonLevToken })
    const bal = reserve * supply / 10 ** decimal
    api.add(nonLevToken, bal)
  }))

  const [levReserveTokens, assetsAndLiabilities] = await Promise.all([
    api.multiCall({ calls: levVaults, abi: 'address:reserveToken', permitFailure: true }),
    api.multiCall({ abi: 'function assetsAndLiabilities() external view returns (uint256 assets,uint256 liabilities,uint256 ratio)', calls: levVaults, permitFailure: true })
  ])

  levVaults.forEach((_vault, i) => {
    const levReserveToken = levReserveTokens[i]
    const assetsAndLiability = assetsAndLiabilities[i]
    if(!levReserveToken || !assetsAndLiability) return
    const levBal = assetsAndLiability.assets - assetsAndLiability.liabilities
    api.add(levReserveToken, levBal)
  })

  if (api.chain ==='ethereum') {
    const [asset, totalAssets] = await Promise.all([
      api.call({ target: osUSDS, abi: 'address:asset' }),
      api.call({ target: osUSDS, abi: 'uint256:totalAssets' })
    ])
    api.add(asset, totalAssets)
  }
}

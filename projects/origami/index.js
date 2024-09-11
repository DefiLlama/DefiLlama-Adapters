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
  const endpoint = GRAPH_URLS[chain]
  module.exports[chain] = {
    tvl: (api) => tvl(api, chain, endpoint),
    borrowed: (api) => liabilities(api, chain, endpoint)
  }
})

async function tvl(
  api,
  chain,
  endpoint,
) {
  const { metrics: [{  investmentVaults }] } = await cachedGraphQuery('origami/' + chain, endpoint, '{ metrics { investmentVaults { id kinds } } }')
  await Promise.all(
    investmentVaults.map(async vault => {
      const isLeveraged = !!vault.kinds.find( v => v === 'Leverage')
      let token = await api.call({ abi: 'address:reserveToken', target: vault.id })

      if (isLeveraged) {
        const assetsAndLiabilities = await api.call({ abi: 'function assetsAndLiabilities() external view returns (uint256 assets,uint256 liabilities,uint256 ratio)', target: vault.id })
        const tvl = assetsAndLiabilities.assets - assetsAndLiabilities.liabilities
        api.add(token, tvl)
      } else {
        token = await api.call({ abi: 'address:baseToken', target: token })
        const decimals = await api.call({ abi: 'uint8:decimals', target: vault.id })
        const supplies = await api.call({ abi: 'uint256:totalSupply', target: vault.id })
        const reserves = await api.call({ abi: 'uint256:reservesPerShare', target: vault.id })
        const bal = reserves * supplies / 10 ** decimals
        api.add(token, bal)
      }
    })
  )
}

async function liabilities(
  api,
  chain,
  endpoint,
) {
  const { metrics: [{  investmentVaults, }] } = await cachedGraphQuery('origami/' + chain, endpoint, '{ metrics { investmentVaults { id kinds } } }')
  await Promise.all(
    investmentVaults.map(async vault => {
      const isLeveraged = !!vault.kinds.find( v => v === 'Leverage')
      if (!isLeveraged) return
      let token = await api.call({ abi: 'address:reserveToken', target: vault.id })
      const assetsAndLiabilities = await api.call({ abi: 'function assetsAndLiabilities() external view returns (uint256 assets,uint256 liabilities,uint256 ratio)', target: vault.id })
      api.add(token, assetsAndLiabilities.liabilities)
    })
  )
}

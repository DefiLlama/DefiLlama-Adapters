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
    tvl: async (api) => {
      await tlv(api, chain, endpoint)

      return api.getBalances();
    },
    borrowed: async (api) =>
      liabilities(api, chain, endpoint)
  }
})

async function tlv(
  api,
  chain,
  endpoint,
) {
  const { metrics: [{ investmentVaults }] } = await cachedGraphQuery('origami/' + chain, endpoint, '{ metrics { investmentVaults { id } } }')
      console.log({investmentVaults, chain})
      const vaults = await investmentVaults.map(vault => vault.id)
      let tokens = await api.multiCall({  abi: 'address:reserveToken', calls: vaults })
      if (chain === 'ethereum') {
        const assetsAndLiabilities = await api.multiCall({  abi: 'function assetsAndLiabilities() external view returns (uint256 assets,uint256 liabilities,uint256 ratio)', calls: vaults })
        const tlv = assetsAndLiabilities.map((al, i) => {
          return al.assets - al.liabilities
        })
        api.add(tokens, tlv)
      } else if (chain === 'arbitrum') {
        tokens = await api.multiCall({  abi: 'address:baseToken', calls: tokens })
        const decimals = await api.multiCall({  abi: 'uint8:decimals', calls: vaults })
        const supplies = await api.multiCall({  abi: 'uint256:totalSupply', calls: vaults })
        const reserves = await api.multiCall({  abi: 'uint256:reservesPerShare', calls: vaults })
        const bals = reserves.map((reserve, i) => reserve * supplies[i] / 10 ** decimals[i])
        api.add(tokens, bals)
      }
    }

    async function liabilities(
      api,
      chain,
      endpoint,
    ) {
      if (chain === 'arbitrum') return
      const { metrics: [{ investmentVaults }] } = await cachedGraphQuery('origami/' + chain, endpoint, '{ metrics { investmentVaults { id } } }')
      const vaults = investmentVaults.map(vault => vault.id)
      let tokens = await api.multiCall({  abi: 'address:reserveToken', calls: vaults })
      const assetsAndLiabilities = await api.multiCall({  abi: 'function assetsAndLiabilities() external view returns (uint256 assets,uint256 liabilities,uint256 ratio)', calls: vaults })
      const liabilities = assetsAndLiabilities.map((al, i) => al.liabilities)
      api.add(tokens, liabilities)
}

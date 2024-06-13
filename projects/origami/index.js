const sdk = require("@defillama/sdk");
const { cachedGraphQuery } = require('../helper/cache')

const GRAPH_URLS = {
  ethereum: sdk.graph.modifyEndpoint('GGN8RoYQBiw2Ui6wUeaKcHsBBSrQzQoryYi2feoTKwPX'), // ethereum
  arbitrum: sdk.graph.modifyEndpoint('AHT1ffJhw7NWdeH3XYbWzMmy5USbB22K3ecVDu8azGuF'), // arbitrum
}

module.exports = {
  doublecounted: true,
}

Object.keys(GRAPH_URLS).forEach(chain => {
  const endpoint = GRAPH_URLS[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const { metrics: [{ investmentVaults }] } = await cachedGraphQuery('origami/' + chain, endpoint, '{ metrics { investmentVaults { id } } }')
      console.log(investmentVaults)
      const vaults = investmentVaults.map(vault => vault.id)
      let tokens = await api.multiCall({  abi: 'address:reserveToken', calls: vaults })
      if (chain === 'arbitrum') 
        tokens = await api.multiCall({  abi: 'address:baseToken', calls: tokens })

      const decimals = await api.multiCall({  abi: 'uint8:decimals', calls: vaults })
      const supplies = await api.multiCall({  abi: 'uint256:totalSupply', calls: vaults })
      const reserves = await api.multiCall({  abi: 'uint256:reservesPerShare', calls: vaults })
      const bals = reserves.map((reserve, i) => reserve * supplies[i] / 10 ** decimals[i])
      console.log(tokens, bals, vaults, api.chain)
      api.add(tokens, bals)
    }
  }
})

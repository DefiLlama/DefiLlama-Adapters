const config = {
    polygon: '',// polygon subgraph
    ethereum: ''// ethereum subgraph
}

Object.keys(config).forEach(chain => {
    const factories = config[chain]
    module.exports[chain] = {
      tvl: async (_, _b, _cb, { api, }) => {
        // get all vaults from subgraph
        // get assetRegistry for all vaults
        // get all assets from all assetregistry
        // get token balances of all assets of all vaults
        // api.addTokens(tokens, balances)
        // erc4626Sum
      }
    }
  })
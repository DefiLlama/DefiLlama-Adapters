module.exports = {
  methodology: "Tokens locked in HypCollateral contracts on different chains.",
}

const config = {
  arbitrum: ['0x4882520D47491561F51ea96aBC0397776Efc6cFd', '0x1d9B044393804CCFa2da3127470C9F65D4E0E5E6',],
  mantle: ['0x4417613C0fe034f7D333BF8a6247EaAAF1d51965', '0x650e8941E4d90b70576fDF1b05dbDc962DA2cab8',],
  mode: ['0x4882520D47491561F51ea96aBC0397776Efc6cFd','0x8BF17893f08C570fBA78E9268d3aFc61f42557f1']
}

Object.keys(config).forEach(chain => {
  let vault = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      if (!Array.isArray(vault)) vault = [vault]
      const tokens = await api.multiCall({ abi: 'address:wrappedToken', calls: vault })
      return api.sumTokens({ tokensAndOwners2: [tokens, vault] })
    }
  }
})
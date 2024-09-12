module.exports = {
  methodology: "Tokens locked in HypCollateral contracts on different chains.",
}

const config = {
  arbitrum: ['0x297CE7A9156b9Dfc5b4468a6fd9ec5FdAd27e23A', '0xf0bDCFB8bfE1c5000481d263D672E1b09D58C3BE',]
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
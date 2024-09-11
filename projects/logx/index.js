const { nullAddress } = require("../helper/tokenMapping")

module.exports = {
  methodology: "Tokens locked in HypCollateral contracts on different chains.",
}

const config = {
  arbitrum: ['0x297CE7A9156b9Dfc5b4468a6fd9ec5FdAd27e23A', '0xf0bDCFB8bfE1c5000481d263D672E1b09D58C3BE', '0x7EA2426a2396A98A370c1a8506D86df8Fd6C8174']
}

const hypTokenConfig = {
  arbitrum: ['0xaf88d065e77c8cC2239327C5EDb3A432268e5831', '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', '0x827d5b0Cc07748B7B1c8Fbef19E288C71ee87FE8']
}

Object.keys(config).forEach(chain => {
  let vault = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      if (!Array.isArray(vault)) vault = [vault]
      const hypTokens = hypTokenConfig[chain];
      const ownerTokens = [];
      for (let i = 0; i < vault.length; i++) {
        ownerTokens.push([[hypTokens[i]], vault[i]])
      }
      console.log(ownerTokens)
      return api.sumTokens({ ownerTokens })
    }
  }
})
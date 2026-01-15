const { txBridgeTvlV2 } = require("../txBridge/util")

module.exports = {
  ethereum: {
    tvl: async (api) => txBridgeTvlV2(api, { 
      chainId: 50104, 
      additionalBridges: ['0xf553E6D903AA43420ED7e3bc2313bE9286A8F987'], 
      extraTokens: [
        '0xc96Aa65F31E41b4Ca6924B86D93e25686019E59C', 
        '0x996d67aa9b37df96428ad3608cb21352bf1fdb90'
      ] 
    }),
  },
}

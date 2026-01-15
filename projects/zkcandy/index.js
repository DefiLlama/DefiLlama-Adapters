const { txBridgeTvlV2 } = require("../txBridge/util")

module.exports = {
  ethereum: {
    tvl: async (api) => txBridgeTvlV2(api, { chainId: 320, }),
  },
}

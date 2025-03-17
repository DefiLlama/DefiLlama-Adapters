const getTvl = require("../txBridgeCustomUSDc/util")

module.exports = {
  ethereum: {
    tvl: async (api) => getTvl(api, { chainId: 50104, }),
  },
}

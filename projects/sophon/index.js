const getTvl = require("../txBridge/util")

module.exports = {
  ethereum: {
    tvl: async (api) => getTvl(api, { chainId: 50104, }),
  },
}

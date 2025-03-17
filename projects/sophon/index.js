const getTvl = require("../txBridge/util")

module.exports = {
  ethereum: {
    tvl: async (api) => getTvl(api, { chainId: 50104, additionalBridges: ['0xf553E6D903AA43420ED7e3bc2313bE9286A8F987'] }),
  },
}

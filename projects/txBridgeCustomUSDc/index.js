const getTvl = require("./util")

module.exports = {
  ethereum: {
    tvl: async (api) => getTvl(api, { chainId: 324, }),
  },
}

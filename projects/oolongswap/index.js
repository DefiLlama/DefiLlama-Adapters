const { getChainTvl } = require("../helper/getUniSubgraphTvl");

module.exports = {
  boba: {
    tvl: getChainTvl({
      boba: "https://api.thegraph.com/subgraphs/name/oolongswap/oolongswap-mainnet",
    })("boba"),
  },
  hallmarks: [
    [1658312537, "Alameda Research exits"],
  ],
};

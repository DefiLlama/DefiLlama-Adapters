const { getChainTvl } = require("../helper/getUniSubgraphTvl");

module.exports = {
  smartbch: {
    tvl: getChainTvl(
      {
        smartbch: "https://subgraphs1.benswap.cash/subgraphs/name/bentokenfinance/bch-exchange",
      },
      "benSwapFactories"
    )("smartbch"),
  },
};
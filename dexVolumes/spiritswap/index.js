const {
  getChainVolume,
  DEFAULT_TOTAL_VOLUME_FIELD,
  DEFAULT_DAILY_VOLUME_FIELD,
} = require("../helper/getUniSubgraphVolume");

const endpoints = {
  fantom:
    "https://api.thegraph.com/subgraphs/name/layer3org/spiritswap-analytics",
};

const graphs = getChainVolume({
  graphUrls: {
    fantom: endpoints.fantom,
  },
  totalVolume: {
    factory: "spiritswapFactories",
    field: DEFAULT_TOTAL_VOLUME_FIELD,
  },
  dailyVolume: {
    factory: "spiritswapDayData",
    field: DEFAULT_DAILY_VOLUME_FIELD,
  },
});

module.exports = {
  volume: {
    fantom: graphs("fantom"),
  },
};

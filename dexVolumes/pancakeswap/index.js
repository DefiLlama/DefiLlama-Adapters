const {
  getChainVolume,
  DEFAULT_TOTAL_VOLUME_FIELD,
  DEFAULT_DAILY_VOLUME_FIELD,
} = require("../helper/getUniSubgraphVolume");

const endpoints = {
  bsc: "https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2",
};

const graphs = getChainVolume({
  graphUrls: {
    bsc: endpoints.bsc,
  },
  totalVolume: {
    factory: "pancakeFactories",
    field: DEFAULT_TOTAL_VOLUME_FIELD,
  },
  dailyVolume: {
    factory: "pancakeDayData",
    field: DEFAULT_DAILY_VOLUME_FIELD,
  },
});

module.exports = {
  bsc: graphs("bsc"),
};

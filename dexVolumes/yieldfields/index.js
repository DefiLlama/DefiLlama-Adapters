const {
  getChainVolume,
  DEFAULT_TOTAL_VOLUME_FIELD,
  DEFAULT_DAILY_VOLUME_FIELD,
} = require("../helper/getUniSubgraphVolume");
const { BSC } = require("../helper/chains");
const { getStartTimestamp } = require("../helper/getStartTimestamp");
const endpoints = {
  [BSC]: "https://api.thegraph.com/subgraphs/name/sotblad/yieldfieldsexchange",
};

const DAILY_VOLUME_FACTORY = "YieldFieldsDayData";

const graphs = getChainVolume({
  graphUrls: {
    [BSC]: endpoints[BSC],
  },
  totalVolume: {
    factory: "YieldFieldsFactory",
    field: DEFAULT_TOTAL_VOLUME_FIELD,
  },
  dailyVolume: {
    factory: DAILY_VOLUME_FACTORY,
    field: DEFAULT_DAILY_VOLUME_FIELD,
  },
});

module.exports = {
  volume: {
    [BSC]: {
      fetch: graphs(BSC),
      start: getStartTimestamp({
        endpoints,
        chain: BSC,
        dailyDataField: `${DAILY_VOLUME_FACTORY}s`,
      }),
    },
  },
};

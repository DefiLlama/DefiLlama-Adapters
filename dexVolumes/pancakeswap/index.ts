import { DexVolumeAdapter } from "../dexVolume.type";

const {
  getChainVolume,
  DEFAULT_TOTAL_VOLUME_FIELD,
  DEFAULT_DAILY_VOLUME_FIELD,
} = require("../helper/getUniSubgraphVolume");
const { BSC } = require("../helper/chains");
const { getStartTimestamp } = require("../helper/getStartTimestamp");
const endpoints = {
  [BSC]: "https://bsc.streamingfast.io/subgraphs/name/pancakeswap/exchange-v2",
};

const DAILY_VOLUME_FACTORY = "pancakeDayData";

const graphs = getChainVolume({
  graphUrls: {
    [BSC]: endpoints[BSC],
  },
  totalVolume: {
    factory: "pancakeFactories",
    field: DEFAULT_TOTAL_VOLUME_FIELD,
  },
  dailyVolume: {
    factory: DAILY_VOLUME_FACTORY,
    field: DEFAULT_DAILY_VOLUME_FIELD,
  },
});

const adapter: DexVolumeAdapter = {
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

export default adapter;

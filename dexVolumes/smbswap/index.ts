const {
  getChainVolume,
  DEFAULT_TOTAL_VOLUME_FIELD,
  DEFAULT_DAILY_VOLUME_FIELD,
} = require("../helper/getUniSubgraphVolume");
const { BSC } = require("../helper/chains");
const { getStartTimestamp } = require("../helper/getStartTimestamp");

import { DexVolumeAdapter } from "../dexVolume.type";

const endpoints = {
  [BSC]: "https://api.thegraph.com/subgraphs/name/cr3k/exchange",
};

const DAILY_VOLUME_FACTORY = "SMBDayData";

const graphs = getChainVolume({
  graphUrls: {
    [BSC]: endpoints[BSC],
  },
  totalVolume: {
    factory: "SMBFactory",
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

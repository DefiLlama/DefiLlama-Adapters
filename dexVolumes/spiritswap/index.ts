import { DexVolumeAdapter } from "../dexVolume.type";

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

const adapter: DexVolumeAdapter = {
  volume: {
    fantom: {
      fetch: graphs("fantom"),
      start: 1620864000,
    },
  },
};

export default adapter;

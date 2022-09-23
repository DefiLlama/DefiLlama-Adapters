import { SimpleVolumeAdapter } from "../../dexVolume.type";

const {
  getChainVolume,
  DEFAULT_TOTAL_VOLUME_FIELD,
  DEFAULT_DAILY_VOLUME_FIELD,
} = require("../../helper/getUniSubgraphVolume");
const { BSC, FANTOM } = require("../../helper/chains");
const { getStartTimestamp } = require("../../helper/getStartTimestamp");
const endpoints = {
  [BSC]: "https://api.thegraph.com/subgraphs/name/whale-swap/exchange-bsc",
  [FANTOM]: "https://api.thegraph.com/subgraphs/name/whale-swap/exchange-ftm",
};

const DAILY_VOLUME_FACTORY = "dayData";

const graphs = getChainVolume({
  graphUrls: {
    [BSC]: endpoints[BSC],
    [FANTOM]: endpoints[FANTOM],
  },
  totalVolume: {
    factory: "whaleswapFactories",
    field: DEFAULT_TOTAL_VOLUME_FIELD,
  },
  dailyVolume: {
    factory: DAILY_VOLUME_FACTORY,
    field: DEFAULT_DAILY_VOLUME_FIELD,
  },
});

const adapter: SimpleVolumeAdapter = {
  volume: {
    [BSC]: {
      fetch: graphs(BSC),
      start: getStartTimestamp({
        endpoints,
        chain: BSC,
        dailyDataField: `${DAILY_VOLUME_FACTORY}s`,
      }),
    },
    [FANTOM]: {
      fetch: graphs(FANTOM),
      start: getStartTimestamp({
        endpoints,
        chain: FANTOM,
        dailyDataField: `${DAILY_VOLUME_FACTORY}s`,
      }),
    },
  },
};

export default adapter;

import { DexVolumeAdapter } from "../dexVolume.type";

const {
  getChainVolume,
  DEFAULT_TOTAL_VOLUME_FIELD,
  DEFAULT_DAILY_VOLUME_FIELD,
} = require("../helper/getUniSubgraphVolume");
const { ETHEREUM } = require("../helper/chains");
const { getStartTimestamp } = require("../helper/getStartTimestamp");

const endpoints = {
  [ETHEREUM]:
    "https://api.thegraph.com/subgraphs/name/1inch-exchange/oneinch-liquidity-protocol-v2",
};

const dailyDataFactory = "mooniswapDayData";

const graphs = getChainVolume({
  graphUrls: {
    [ETHEREUM]: endpoints[ETHEREUM],
  },
  totalVolume: {
    factory: "mooniswapFactories",
    field: DEFAULT_TOTAL_VOLUME_FIELD,
  },
  dailyVolume: {
    factory: dailyDataFactory,
    field: DEFAULT_DAILY_VOLUME_FIELD,
  },
});

const adapter: DexVolumeAdapter = {
  volume: {
    [ETHEREUM]: {
      fetch: graphs(ETHEREUM),
      start: getStartTimestamp({
        endpoints,
        chain: ETHEREUM,
        dailyDataField: `${dailyDataFactory}s`,
      }),
    },
  },
};

export default adapter;

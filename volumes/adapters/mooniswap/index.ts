import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { ETHEREUM } from "../../helper/chains";
import { getStartTimestamp } from "../../helper/getStartTimestamp";
import { DEFAULT_DAILY_VOLUME_FIELD, DEFAULT_TOTAL_VOLUME_FIELD, getChainVolume } from "../../helper/getUniSubgraphVolume";

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

const adapter: SimpleVolumeAdapter = {
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

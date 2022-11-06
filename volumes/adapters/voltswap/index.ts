import { BreakdownVolumeAdapter, DISABLED_ADAPTER_KEY } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import disabledAdapter from "../../helper/disabledAdapter";
const {
  getChainVolume,
  DEFAULT_TOTAL_VOLUME_FIELD,
  DEFAULT_DAILY_VOLUME_FIELD,
} = require("../../helper/getUniSubgraphVolume");
const { getStartTimestamp } = require("../../helper/getStartTimestamp");
const endpoints = {
  [CHAIN.METER]: "https://graph-meter.voltswap.finance/subgraphs/name/meterio/uniswap-v2-subgraph",
};

const DAILY_VOLUME_FACTORY = "uniswapDayData";

const graphs = getChainVolume({
  graphUrls: endpoints,
  totalVolume: {
    factory: "uniswapFactories",
    field: DEFAULT_TOTAL_VOLUME_FIELD,
  },
  dailyVolume: {
    factory: DAILY_VOLUME_FACTORY,
    field: DEFAULT_DAILY_VOLUME_FIELD,
  },
});

const adapter: BreakdownVolumeAdapter = {
  breakdown: {
    v1: {
      [DISABLED_ADAPTER_KEY]: disabledAdapter
    },
    v2: {
      [CHAIN.METER]: {
        fetch: graphs(CHAIN.METER),
        start: getStartTimestamp({
          endpoints,
          chain: CHAIN.METER,
          dailyDataField: `${DAILY_VOLUME_FACTORY}s`,
        }),
      }
    },
  },
};

export default adapter;

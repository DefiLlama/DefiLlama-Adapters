import { BreakdownVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import { DEFAULT_DAILY_VOLUME_FACTORY, DEFAULT_DAILY_VOLUME_FIELD, DEFAULT_TOTAL_VOLUME_FACTORY, DEFAULT_TOTAL_VOLUME_FIELD, getChainVolume } from "../../helper/getUniSubgraphVolume";

const endpoints = {
  [CHAIN.POLYGON]: "https://api.fura.org/subgraphs/name/quickswap",
};

const graphs = getChainVolume({
  graphUrls: endpoints,
  totalVolume: {
    factory: DEFAULT_TOTAL_VOLUME_FACTORY,
    field: DEFAULT_TOTAL_VOLUME_FIELD,
  },
  dailyVolume: {
    factory: DEFAULT_DAILY_VOLUME_FACTORY,
    field: DEFAULT_DAILY_VOLUME_FIELD,
    dateField: "date"
  },
});

const endpointsV3 = {
  [CHAIN.POLYGON]: "https://api.thegraph.com/subgraphs/name/sameepsi/quickswap-v3"
};
const graphsV3 = getChainVolume({
  graphUrls: endpointsV3,
  totalVolume: {
    factory: "factories",
    field: "totalVolumeUSD",
  },
  dailyVolume: {
    factory: "algebraDayData",
    field: "volumeUSD",
    dateField: "date"
  },
});


const adapter: BreakdownVolumeAdapter = {
  breakdown: {
    v2: {
      [CHAIN.POLYGON]: {
        fetch: graphs(CHAIN.POLYGON),
        start: async () => 1602118043
      },
    },
    v3: {
      [CHAIN.POLYGON]: {
        fetch: graphsV3(CHAIN.POLYGON),
        start: async () => 1662425243
      },
    }
  },
};

export default adapter;

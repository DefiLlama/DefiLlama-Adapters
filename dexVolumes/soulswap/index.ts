import { getChainVolume } from "../helper/getUniSubgraphVolume";
import { getStartTimestamp } from "../helper/getStartTimestamp";
import { FANTOM } from "../helper/chains";
import { DexVolumeAdapter } from "../dexVolume.type";

const endpoints = {
// [AVAX]: "https://api.thegraph.com/subgraphs/name/soulswapfinance/avalanche-exchange
  [FANTOM]: "https://api.thegraph.com/subgraphs/name/soulswapfinance/fantom-exchange",
};

const VOLUME_FIELD = "volumeUSD";

const graphs = getChainVolume({
  graphUrls: {
    // [AVAX]: endpoints[AVAX],
    [FANTOM]: endpoints[FANTOM]
  },
  totalVolume: {
    factory: "factories",
    field: VOLUME_FIELD,
  },
  dailyVolume: {
    factory: "dayData",
    field: VOLUME_FIELD,
  },
});

const startTimeQuery = {
  endpoints,
  dailyDataField: "dayDatas",
  volumeField: VOLUME_FIELD,
};

const volume = Object.keys(endpoints).reduce(
  (acc, chain) => ({
    ...acc,
    [chain]: {
      fetch: graphs(chain),
      start: getStartTimestamp({ ...startTimeQuery, chain }),
    },
  }),
  {}
);

const adapter: DexVolumeAdapter = {
  volume,
};

export default adapter;

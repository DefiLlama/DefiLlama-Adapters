import { getChainVolume } from "../../helper/getUniSubgraphVolume";
import { getStartTimestamp } from "../../helper/getStartTimestamp";
import { FANTOM } from "../../helper/chains";
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { Chain } from "@defillama/sdk/build/general";

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
      fetch: graphs(chain as Chain),
      start: getStartTimestamp({ ...startTimeQuery, chain }),
    },
  }),
  {}
);

const adapter: SimpleVolumeAdapter = {
  volume,
};

export default adapter;

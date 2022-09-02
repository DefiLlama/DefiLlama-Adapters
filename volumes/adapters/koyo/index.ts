import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { BOBA } from "../../helper/chains";
import { getChainVolume } from "../../helper/getUniSubgraphVolume";

const endpoints = {
  [BOBA]:
    "https://thegraph.com/hosted-service/subgraph/koyo-finance/exchange-subgraph-boba",
};

const graphs = getChainVolume({
  graphUrls: endpoints,
  totalVolume: {
    factory: "koyos",
    field: "totalSwapVolume",
  },
  hasDailyVolume: false,
});

const adapter: SimpleVolumeAdapter = {
  volume: {
    [BOBA]: {
      fetch: graphs(BOBA),
      start: async () => 1655104044,
      customBackfill: undefined,
    },
  },
};

export default adapter;

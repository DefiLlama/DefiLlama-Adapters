import { DexVolumeAdapter } from "../dexVolume.type";
import { getChainVolume } from "../helper/getUniSubgraphVolume";
import { BOBA } from "../helper/chains";

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

const adapter: DexVolumeAdapter = {
  volume: {
    [BOBA]: {
      fetch: graphs(BOBA),
      start: 1655104044,
      customBackfill: () => {},
    },
  },
};

export default adapter;

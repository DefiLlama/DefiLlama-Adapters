import { DexVolumeAdapter } from "../dexVolume.type";
import { getChainVolume } from "../helper/getUniSubgraphVolume";
import { ARBITRUM, ETHEREUM, POLYGON } from "../helper/chains";
import customBackfill from "../helper/customBackfill";

const endpoints = {
  [ETHEREUM]: "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer",
  [POLYGON]:
    "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-polygon-v2",
  [ARBITRUM]:
    "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-arbitrum-v2",
};

const graphs = getChainVolume({
  graphUrls: {
    [ETHEREUM]: endpoints[ETHEREUM],
    [POLYGON]: endpoints[POLYGON],
    [ARBITRUM]: endpoints[ARBITRUM],
  },
  totalVolume: {
    factory: "balancers",
    field: "totalSwapVolume",
  },
  hasDailyVolume: false,
});

const adapter: DexVolumeAdapter = {
  volume: {
    [ETHEREUM]: {
      fetch: graphs(ETHEREUM),
      start: async () => 0,
      customBackfill: customBackfill(ETHEREUM, graphs),
    },
    // POLYGON
    [POLYGON]: {
      fetch: graphs(POLYGON),
      start: async () => 0,
      customBackfill: customBackfill(POLYGON, graphs),
    },
    // ARBITRUM
    [ARBITRUM]: {
      fetch: graphs(ARBITRUM),
      start: async () => 0,
      customBackfill: customBackfill(ARBITRUM, graphs),
    },
  },
};

export default adapter;

// TODO custom backfill have to get specific block at start of each day

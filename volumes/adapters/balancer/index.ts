import { ChainEndpoints, BreakdownVolumeAdapter, Adapter } from "../../dexVolume.type";
import { getChainVolume } from "../../helper/getUniSubgraphVolume";
import customBackfill from "../../helper/customBackfill";
import { CHAIN } from "../../helper/chains";
import { Chain } from "@defillama/sdk/build/general";

const endpoints: ChainEndpoints = {
  [CHAIN.ETHEREUM]: "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-v2",
  [CHAIN.POLYGON]:
    "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-polygon-v2",
  [CHAIN.ARBITRUM]:
    "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-arbitrum-v2",
};

const graphParams = {
  totalVolume: {
    factory: "balancers",
    field: "totalSwapVolume",
  },
  hasDailyVolume: false,
}

const graphs = getChainVolume({
  graphUrls: endpoints,
  ...graphParams
});

const v1graphs = getChainVolume({
  graphUrls: {
    [CHAIN.ETHEREUM]: "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer"
  },
  ...graphParams
});

const adapter: BreakdownVolumeAdapter = {
  breakdown: {
    v1: {
      [CHAIN.ETHEREUM]: {
        fetch: v1graphs(CHAIN.ETHEREUM),
        start: async () => 1582761600,
      },
    },
    v2: Object.keys(endpoints).reduce((acc, chain) => {
      return {
        ...acc,
        [chain]: {
          fetch: graphs(chain as Chain),
          start: async () => 0,
        }
      }
    }, {} as Adapter)
  }
}

export default adapter;

// TODO custom backfill have to get specific block at start of each day

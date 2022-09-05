import { ChainEndpoints, SimpleVolumeAdapter } from "../../dexVolume.type";
import { getChainVolume } from "../../helper/getUniSubgraphVolume";
import customBackfill from "../../helper/customBackfill";
import { CHAIN } from "../../helper/chains";
import { Chain } from "@defillama/sdk/build/general";

const endpoints: ChainEndpoints = {
  [CHAIN.ETHEREUM]: "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer",
  [CHAIN.POLYGON]:
    "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-polygon-v2",
  [CHAIN.ARBITRUM]:
    "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-arbitrum-v2",
};

const graphs = getChainVolume({
  graphUrls: endpoints,
  totalVolume: {
    factory: "balancers",
    field: "totalSwapVolume",
  },
  hasDailyVolume: false,
});

const adapter: SimpleVolumeAdapter = {
  volume: Object.keys(endpoints).reduce((acc, chain) => {
    return {
      ...acc,
      [chain]: {
        fetch: graphs(chain as Chain),
        start: async () => 0,
        customBackfill: customBackfill(CHAIN.ETHEREUM, graphs),
      }
    }
  }, {} as SimpleVolumeAdapter['volume'])
};

export default adapter;

// TODO custom backfill have to get specific block at start of each day

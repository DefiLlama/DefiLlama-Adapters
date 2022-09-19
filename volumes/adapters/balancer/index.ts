import { ChainEndpoints, BreakdownVolumeAdapter, Adapter } from "../../dexVolume.type";
import { getChainVolume } from "../../helper/getUniSubgraphVolume";
import customBackfill from "../../helper/customBackfill";
import { CHAIN } from "../../helper/chains";
import { Chain } from "@defillama/sdk/build/general";
import { getStartTimestamp } from "../../helper/getStartTimestamp";

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
        customBackfill: customBackfill(CHAIN.ETHEREUM, v1graphs)
      },
    },
    v2: Object.keys(endpoints).reduce((acc, chain) => {
      return {
        ...acc,
        [chain]: {
          fetch: graphs(chain as Chain),
          customBackfill: customBackfill(chain as Chain, graphs),
          start: getStartTimestamp({
            endpoints,
            chain: chain,
            dailyDataField: `balancerSnapshots`,
            dateField: 'timestamp',
            volumeField: 'totalSwapVolume'
          }),
        }
      }
    }, {} as Adapter)
  }
}

export default adapter;

// TODO custom backfill have to get specific block at start of each day

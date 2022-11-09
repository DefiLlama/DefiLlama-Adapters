import { ChainEndpoints, SimpleVolumeAdapter } from "../../dexVolume.type";
import { getChainVolume } from "../../helper/getUniSubgraphVolume";
import customBackfill from "../../helper/customBackfill";
import { CHAIN } from "../../helper/chains";
import { Chain } from "@defillama/sdk/build/general";

const endpoints: ChainEndpoints = {
  [CHAIN.FANTOM]: "https://api.thegraph.com/subgraphs/name/beethovenxfi/beethovenx",
  [CHAIN.OPTIMISM]: "https://api.thegraph.com/subgraphs/name/beethovenxfi/beethovenx-optimism",
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
  ...graphParams,
});

const adapter: SimpleVolumeAdapter = {
  volume: Object.keys(endpoints).reduce((acc, chain: any) => {
    return {
      ...acc,
      [chain]: {
        fetch: graphs(chain as Chain),
        start: async () => 1633392000,
        customBackfill: customBackfill(chain, graphs),
      }
    }
  }, {} as SimpleVolumeAdapter['volume'])
};

export default adapter;

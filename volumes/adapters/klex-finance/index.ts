import { ChainEndpoints, SimpleVolumeAdapter } from "../../dexVolume.type";
import { getChainVolume } from "../../helper/getUniSubgraphVolume";
import customBackfill from "../../helper/customBackfill";
import { CHAIN } from "../../helper/chains";
import { Chain } from "@defillama/sdk/build/general";
import { getStartTimestamp } from "../../helper/getStartTimestamp";

const endpoints: ChainEndpoints = {
  [CHAIN.KLAYTN]: "https://graph-prod.klex.finance/subgraphs/name/klex-staging-2-mainnet",
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

const adapter: SimpleVolumeAdapter = {
  volume: Object.keys(endpoints).reduce((acc, chain: any) => {
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
  }, {} as SimpleVolumeAdapter['volume'])
};

export default adapter;

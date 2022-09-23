import { Chain } from "@defillama/sdk/build/general";
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import customBackfill from "../../helper/customBackfill";
const {
  getChainVolume,
} = require("../../helper/getUniSubgraphVolume");
const endpoints = {
  [CHAIN.BSC]: "https://api.thegraph.com/subgraphs/name/wardenluna/wardenswap",
  [CHAIN.OPTIMISM]:  "https://api.thegraph.com/subgraphs/name/wardenluna/wardenswap-optimism",
  [CHAIN.ARBITRUM]: "https://api.thegraph.com/subgraphs/name/wardenluna/wardenswap-arbitrum",
  [CHAIN.ETHEREUM]: "https://api.thegraph.com/subgraphs/name/wardenluna/wardenswap-ethereum",
  [CHAIN.POLYGON]: "https://api.thegraph.com/subgraphs/name/wardenluna/wardenswap-polygon",
};


const VOLUME_FIELD = "volumeUSD";
const graphs = getChainVolume({
  graphUrls: {
    [CHAIN.BSC]: endpoints[CHAIN.BSC],
    [CHAIN.OPTIMISM]: endpoints[CHAIN.OPTIMISM],
    [CHAIN.ARBITRUM]: endpoints[CHAIN.ARBITRUM],
    [CHAIN.ETHEREUM]: endpoints[CHAIN.ETHEREUM],
    [CHAIN.POLYGON]: endpoints[CHAIN.POLYGON],
  },
  totalVolume: {
    factory: "wardenSwaps",
    field: VOLUME_FIELD,
  },
  hasDailyVolume: false,
});


const adapter: SimpleVolumeAdapter = {
  volume: Object.keys(endpoints).reduce((acc, chain: any) => {
    return {
      ...acc,
      [chain]: {
        fetch: graphs(chain as Chain),
        start: async () => 1657443314,
        customBackfill: customBackfill(chain, graphs),
      }
    }
  }, {} as SimpleVolumeAdapter['volume'])
};

export default adapter;

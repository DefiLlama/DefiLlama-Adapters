import { Chain } from "@defillama/sdk/build/general";
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import customBackfill from "../../helper/customBackfill";

const {
  getChainVolume,
} = require("../../helper/getUniSubgraphVolume");
const endpoints = {
  [CHAIN.ETHEREUM]: "https://api.thegraph.com/subgraphs/name/templedao/templedao-core"
};

const VOLUME_FIELD = "volumeUSD";
const graphs = getChainVolume({
  graphUrls: endpoints,
  totalVolume: {
    factory: "metrics",
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
        start: async () => 1655003840,
        customBackfill: customBackfill(chain as Chain, graphs)
      }
    }
  }, {} as SimpleVolumeAdapter['volume'])
};

export default adapter;

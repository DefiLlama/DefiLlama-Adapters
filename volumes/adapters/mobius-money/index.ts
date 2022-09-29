import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { getChainVolume } from "../../helper/getUniSubgraphVolume";
import { CHAIN } from "../../helper/chains";
import { Chain } from "@defillama/sdk/build/general";
import customBackfill from "../../helper/customBackfill";

const endpoints = {
  [CHAIN.CELO]: "https://api.thegraph.com/subgraphs/name/d-mooers/mobius",
};

const graphs = getChainVolume({
  graphUrls: endpoints,
  totalVolume: {
    factory: "tradeVolumes",
    field: "volume",
  },
  dailyVolume: {
    factory: "dailyVolume",
    field: "volume",
    dateField: "timestamp"
  },
});

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.CELO]: {
      fetch: graphs(CHAIN.CELO),
      start: async () => 1636514733,
      // customBackfill: customBackfill(CHAIN.CELO as Chain, graphs)
    },
  },
};

export default adapter;

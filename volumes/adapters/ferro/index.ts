import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { getChainVolume } from "../../helper/getUniSubgraphVolume";
import { CHAIN } from "../../helper/chains";


const endpoints = {
  [CHAIN.CRONOS]: "https://graph.cronoslabs.com/subgraphs/name/ferro/swap",
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
    [CHAIN.CRONOS]: {
      fetch: graphs(CHAIN.CRONOS),
      start: async () => 1661731973,
    },
  },
};

export default adapter;

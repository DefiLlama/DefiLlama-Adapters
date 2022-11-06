import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import { getChainVolume } from "../../helper/getUniSubgraphVolume";

const endpoints = {
  [CHAIN.ETHEREUM]: "https://api.thegraph.com/subgraphs/name/omegasyndicate/defiplaza"
};

const graphs = getChainVolume({
  graphUrls: endpoints,
  totalVolume: {
    factory: "factories",
    field: "totalTradeVolumeUSD",
  },
  dailyVolume: {
    factory: "dailie",
    field: "tradeVolumeUSD",
    dateField: "date"
  },
});

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.ETHEREUM]: {
      fetch: graphs(CHAIN.ETHEREUM),
      start: async () => 1633237008
    },
  },
};

export default adapter;

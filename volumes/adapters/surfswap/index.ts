import { ChainEndpoints, BreakdownVolumeAdapter } from "../../dexVolume.type";
import { getChainVolume } from "../../helper/getUniSubgraphVolume";
import { CHAIN } from "../../helper/chains";
import { Chain } from "@defillama/sdk/build/general";

const endpoints: ChainEndpoints = {
  [CHAIN.KAVA]: "https://the-graph.kava.io/subgraphs/name/surfswap-dex",
};

const graphs = getChainVolume({
  graphUrls: endpoints,
  totalVolume: {
    factory: "uniswapFactories",
    field: "totalVolumeUSD",
  },
  dailyVolume: {
    factory: "uniswapDayData",
    field: "dailyVolumeUSD",
  },
});

const v1graphs = getChainVolume({
  graphUrls: {
    [CHAIN.KAVA]: "https://the-graph.kava.io/subgraphs/name/surfswap-stable-amm",
  },
  totalVolume: {
    factory: "tradeVolumes",
    field: "volume",
  },
  dailyVolume: {
    factory: "dailyVolume",
    field: "volume",
    dateField: "timestamp"
  }
});

const adapter: BreakdownVolumeAdapter = {
  breakdown: {
    classic: {
      [CHAIN.KAVA]: {
        fetch: graphs(CHAIN.KAVA as Chain),
        start: async () => 1659715200,
      },
    },
    "stable-amm": {
      [CHAIN.KAVA]: {
        fetch: v1graphs(CHAIN.KAVA as Chain),
        start: async () => 1656547200,
      },
    },
  }
}

export default adapter;

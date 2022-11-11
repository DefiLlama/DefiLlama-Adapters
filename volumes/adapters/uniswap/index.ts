import { Adapter, BreakdownVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import { getStartTimestamp } from "../../helper/getStartTimestamp";

const {
  getChainVolume,
  DEFAULT_DAILY_VOLUME_FACTORY,
  DEFAULT_TOTAL_VOLUME_FIELD,
} = require("../../helper/getUniSubgraphVolume");

const v1Endpoints = {
  [CHAIN.ETHEREUM]: "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap",
};

const v2Endpoints = {
  [CHAIN.ETHEREUM]: "https://api.thegraph.com/subgraphs/name/ianlapham/uniswapv2",
};

const v3Endpoints = {
  [CHAIN.ETHEREUM]: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
  [CHAIN.OPTIMISM]:
    "https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis",
  [CHAIN.ARBITRUM]:
    "https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-dev",
  [CHAIN.POLYGON]:
    "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon",
};

const VOLUME_USD = "volumeUSD";

const v1Graph = getChainVolume({
  graphUrls: v1Endpoints,
  totalVolume: {
    factory: "uniswaps",
    field: "totalVolumeUSD",
  },
  dailyVolume: {
    factory: DEFAULT_DAILY_VOLUME_FACTORY,
    field: "dailyVolumeInUSD",
  },
});

const v2Graph = getChainVolume({
  graphUrls: v2Endpoints
});

const v3Graphs = getChainVolume({
  graphUrls: v3Endpoints,
  totalVolume: {
    factory: "factories",
    field: DEFAULT_TOTAL_VOLUME_FIELD,
  },
  dailyVolume: {
    factory: DEFAULT_DAILY_VOLUME_FACTORY,
    field: VOLUME_USD,
  },
});

const adapter: BreakdownVolumeAdapter = {
  breakdown: {
    v1: {
      [CHAIN.ETHEREUM]: {
        fetch: v1Graph(CHAIN.ETHEREUM),
        start: async () => 1541203200,
      },
    },
    v2: {
      [CHAIN.ETHEREUM]: {
        fetch: v2Graph(CHAIN.ETHEREUM),
        start: getStartTimestamp({
          endpoints: v2Endpoints,
          chain: CHAIN.ETHEREUM,
        }),
      },
    },
    v3: Object.keys(v3Endpoints).reduce((acc, chain) => {
      acc[chain] = {
        fetch: v3Graphs(chain),
        start: getStartTimestamp({
          endpoints: v3Endpoints,
          chain: chain,
          volumeField: VOLUME_USD,
        })
      }
      return acc
    }, {} as Adapter)
  }
}

export default adapter;

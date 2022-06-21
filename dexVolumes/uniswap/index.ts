import { DexBreakdownAdapter } from "../dexVolume.type";

const {
  getChainVolume,
  DEFAULT_DAILY_VOLUME_FACTORY,
  DEFAULT_TOTAL_VOLUME_FIELD,
} = require("../helper/getUniSubgraphVolume");

const { ARBITRUM, ETHEREUM, OPTIMISM, POLYGON } = require("../helper/chains");

const { getStartTimestamp } = require("../helper/getStartTimestamp");

const v1Endpoints = {
  [ETHEREUM]: "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap",
};

const v2Endpoints = {
  [ETHEREUM]: "https://api.thegraph.com/subgraphs/name/ianlapham/uniswapv2",
};

const v3Endpoints = {
  [ETHEREUM]: "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3",
  [OPTIMISM]:
    "https://api.thegraph.com/subgraphs/name/ianlapham/optimism-post-regenesis",
  [ARBITRUM]:
    "https://api.thegraph.com/subgraphs/name/ianlapham/arbitrum-dev",
  [POLYGON]:
    "https://api.thegraph.com/subgraphs/name/ianlapham/uniswap-v3-polygon",
};

const VOLUME_USD = "volumeUSD";

const v1Graph = getChainVolume({
  graphUrls: {
    [ETHEREUM]: v1Endpoints[ETHEREUM],
  },
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
  graphUrls: {
    [ETHEREUM]: v2Endpoints[ETHEREUM],
  },
});

const v3Graphs = getChainVolume({
  graphUrls: {
    ...v3Endpoints,
  },
  totalVolume: {
    factory: "factories",
    field: DEFAULT_TOTAL_VOLUME_FIELD,
  },
  dailyVolume: {
    factory: DEFAULT_DAILY_VOLUME_FACTORY,
    field: VOLUME_USD,
  },
});

const adapter: DexBreakdownAdapter = {
  breakdown: {
    v1: {
      [ETHEREUM]: {
        fetch: v1Graph(ETHEREUM),
        start: 1541203200,
      },
    },
    v2: {
      [ETHEREUM]: {
        fetch: v2Graph(ETHEREUM),
        start: getStartTimestamp({
          endpoints: v2Endpoints,
          chain: ETHEREUM,
        }),
      },
    },
    v3: {
      [ETHEREUM]: {
        fetch: v3Graphs(ETHEREUM),
        start: getStartTimestamp({
          endpoints: v3Endpoints,
          chain: ETHEREUM,
          volumeField: VOLUME_USD,
        }),
      },
      [ARBITRUM]: {
        fetch: v3Graphs(ARBITRUM),
        start: getStartTimestamp({
          endpoints: v3Endpoints,
          chain: ARBITRUM,
          volumeField: VOLUME_USD,
        }),
      },
      [POLYGON]: {
        fetch: v3Graphs(POLYGON),
        start: getStartTimestamp({
          endpoints: v3Endpoints,
          chain: POLYGON,
          volumeField: VOLUME_USD,
        }),
      },
    },
  },
};

export default adapter;

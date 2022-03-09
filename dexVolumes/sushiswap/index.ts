import { getChainVolume } from "../helper/getUniSubgraphVolume";
import { getStartTimestamp } from "../helper/getStartTimestamp";
import {
  ARBITRUM,
  AVAX,
  BSC,
  CELO,
  ETHEREUM,
  FANTOM,
  HARMONY,
  HECO,
  POLYGON,
  XDAI,
} from "../helper/chains";
import { DexVolumeAdapter } from "../dexVolume.type";

const endpoints = {
  [ARBITRUM]:
    "https://api.thegraph.com/subgraphs/name/sushiswap/arbitrum-exchange",
  [AVAX]:
    "https://api.thegraph.com/subgraphs/name/sushiswap/avalanche-exchange",
  [BSC]: "https://api.thegraph.com/subgraphs/name/sushiswap/bsc-exchange",
  // [CELO]: "https://api.thegraph.com/subgraphs/name/sushiswap/celo-exchange",
  [ETHEREUM]: "https://api.thegraph.com/subgraphs/name/sushiswap/exchange",
  [FANTOM]: "https://api.thegraph.com/subgraphs/name/sushiswap/fantom-exchange",
  [HARMONY]:
    "https://sushi.graph.t.hmny.io/subgraphs/name/sushiswap/harmony-exchange",
  // [HECO]: "https://q.hg.network/subgraphs/name/heco-exchange/heco",
  //'okexchain': 'https://q.hg.network/subgraphs/name/okex-exchange/oec',
  //'okexchain': 'https://q.hg.network/subgraphs/name/sushiswap/okex-exchange',
  [POLYGON]: "https://api.thegraph.com/subgraphs/name/sushiswap/matic-exchange",
  [XDAI]: "https://api.thegraph.com/subgraphs/name/sushiswap/xdai-exchange",
};

const VOLUME_FIELD = "volumeUSD";

const graphs = getChainVolume({
  graphUrls: {
    [ARBITRUM]: endpoints[ARBITRUM],
    [AVAX]: endpoints[AVAX],
    [BSC]: endpoints[BSC],
    // [CELO]: endpoints[CELO],
    [ETHEREUM]: endpoints[ETHEREUM],
    [FANTOM]: endpoints[FANTOM],
    [HARMONY]: endpoints[HARMONY],
    // [HECO]: endpoints[HECO],
    [POLYGON]: endpoints[POLYGON],
    [XDAI]: endpoints[XDAI],
  },
  totalVolume: {
    factory: "factories",
    field: VOLUME_FIELD,
  },
  dailyVolume: {
    factory: "dayData",
    field: VOLUME_FIELD,
  },
});

const startTimeQuery = {
  endpoints,
  dailyDataField: "dayDatas",
  volumeField: VOLUME_FIELD,
};

const volume = Object.keys(endpoints).reduce(
  (acc, chain) => ({
    ...acc,
    [chain]: {
      fetch: graphs(chain),
      start: getStartTimestamp({ ...startTimeQuery, chain }),
    },
  }),
  {}
);

const adapter: DexVolumeAdapter = {
  volume,
};

export default adapter;

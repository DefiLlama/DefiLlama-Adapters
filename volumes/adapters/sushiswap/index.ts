import { getChainVolume } from "../../helper/getUniSubgraphVolume";
import { getStartTimestamp } from "../../helper/getStartTimestamp";
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
  MOONRIVER
} from "../../helper/chains";
import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { Chain } from "@defillama/sdk/build/general";

const endpoints = {
  [ETHEREUM]: "https://api.thegraph.com/subgraphs/name/sushiswap/exchange",
  [BSC]: "https://api.thegraph.com/subgraphs/name/sushiswap/bsc-exchange",
  [POLYGON]: "https://api.thegraph.com/subgraphs/name/sushiswap/matic-exchange",
  [FANTOM]: "https://api.thegraph.com/subgraphs/name/sushiswap/fantom-exchange",
  [ARBITRUM]: "https://api.thegraph.com/subgraphs/name/sushiswap/arbitrum-exchange",
  [CELO]: "https://api.thegraph.com/subgraphs/name/sushiswap/celo-exchange",
  [AVAX]: "https://api.thegraph.com/subgraphs/name/sushiswap/avalanche-exchange",
  [HARMONY]: "https://api.thegraph.com/subgraphs/name/sushiswap/harmony-exchange",
  [MOONRIVER]: "https://api.thegraph.com/subgraphs/name/sushiswap/moonriver-exchange",
  [XDAI]: "https://api.thegraph.com/subgraphs/name/sushiswap/xdai-exchange",
  // [HECO]: "https://q.hg.network/subgraphs/name/heco-exchange/heco",
  //'okexchain': 'https://q.hg.network/subgraphs/name/okex-exchange/oec',
  //'okexchain': 'https://q.hg.network/subgraphs/name/sushiswap/okex-exchange',
};

const VOLUME_FIELD = "volumeUSD";

const graphs = getChainVolume({
  graphUrls: endpoints,
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
      fetch: graphs(chain as Chain),
      start: getStartTimestamp({ ...startTimeQuery, chain }),
    },
  }),
  {}
);

const adapter: SimpleVolumeAdapter = {
  volume,
};

export default adapter;

import { DexVolumeAdapter } from "../dexVolume.type";

const { getChainVolume } = require("../helper/getUniSubgraphVolume");
const {
  ARBITRUM,
  BSC,
  ETHEREUM,
  HECO,
  OKEXCHAIN,
  POLYGON,
} = require("../helper/chains");
const { getStartTimestamp } = require("../helper/getStartTimestamp");

const endpoints = {
  [ARBITRUM]:
    "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-arbitrum",
  [BSC]: "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-bsc",
  [ETHEREUM]: "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2",
  [HECO]: "https://n10.hg.network/subgraphs/name/dodoex-v2-heco-hg/heco",
  // [OKEXCHAIN]: "https://graph.kkt.one/subgraphs/name/dodoex/dodoex-v2-okchain",
  [POLYGON]: "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-polygon",
};

const DAILY_VOLUME_FACTORY = "dodoDayData";
const VOLUME_FIELD = "volumeUSD";

const graphs = getChainVolume({
  graphUrls: {
    [ARBITRUM]: endpoints[ARBITRUM],
    [BSC]: endpoints[BSC],
    [ETHEREUM]: endpoints[ETHEREUM],
    [HECO]: endpoints[HECO],
    // [OKEXCHAIN]: endpoints[OKEXCHAIN],
    [POLYGON]: endpoints[POLYGON],
  },
  totalVolume: {
    factory: "dodoZoos",
    field: VOLUME_FIELD,
  },
  dailyVolume: {
    factory: DAILY_VOLUME_FACTORY,
    field: VOLUME_FIELD,
  },
});

const startTimeQuery = {
  endpoints,
  dailyDataField: `${DAILY_VOLUME_FACTORY}s`,
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

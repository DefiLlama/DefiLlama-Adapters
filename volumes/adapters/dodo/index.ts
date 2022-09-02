import { DexVolumeAdapter } from "../../dexVolume.type";
import { ARBITRUM, AURORA, AVAX, BOBA, BSC, ETHEREUM, POLYGON } from "../../helper/chains";

const { getChainVolume } = require("../../helper/getUniSubgraphVolume");
const { getStartTimestamp } = require("../../helper/getStartTimestamp");

const endpoints = {
  [ETHEREUM]: "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2",
  [BSC]: "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-bsc",
  [POLYGON]: "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-polygon",
  [ARBITRUM]:
    "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-arbitrum",
  ["MOONRIVER"]: "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-moonriver",
  [AURORA]: "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-aurora",
  [AVAX]: "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-avax",
  [BOBA]: "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-boba"
  // [HECO]: "https://n10.hg.network/subgraphs/name/dodoex-mine-v3-heco/heco",
  // [OKEXCHAIN]: "https://graph.kkt.one/subgraphs/name/dodoex/dodoex-v2-okchain",
};

const DAILY_VOLUME_FACTORY = "dodoDayData";
const VOLUME_FIELD = "volumeUSD";

const graphs = getChainVolume({
  graphUrls: endpoints,
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

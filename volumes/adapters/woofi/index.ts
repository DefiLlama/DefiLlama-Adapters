import { SimpleVolumeAdapter } from "../../dexVolume.type";
import {  AVAX, BSC, FANTOM, POLYGON, ARBITRUM } from "../../helper/chains";

const { getChainVolume } = require("../../helper/getUniSubgraphVolume");
const { getStartTimestamp } = require("../../helper/getStartTimestamp");

const endpoints = {
  [AVAX]: "https://api.thegraph.com/subgraphs/name/woonetwork/woofi-avax",
  [BSC]: "https://api.thegraph.com/subgraphs/name/woonetwork/woofi-bsc",
  [FANTOM]: "https://api.thegraph.com/subgraphs/name/woonetwork/woofi-fantom",
  [POLYGON]: "https://api.thegraph.com/subgraphs/name/woonetwork/woofi-polygon",
  [ARBITRUM]: "https://api.thegraph.com/subgraphs/name/woonetwork/woofi-arbitrum",
};

const TOTAL_VOLUME_FACTORY = "globalVariables";
const TOTAL_VOLUME_FIELD = "realTotalVolumeUSD";

const DAILY_VOLUME_FACTORY = "dayData";
const DAILY_VOLUME_FIELD = "realVolumeUSD";

const graphs = getChainVolume({
  graphUrls: endpoints,
  totalVolume: {
    factory: TOTAL_VOLUME_FACTORY,
    field: TOTAL_VOLUME_FIELD,
  },
  dailyVolume: {
    factory: DAILY_VOLUME_FACTORY,
    field: DAILY_VOLUME_FIELD,
  },
});

const startTimeQuery = {
  endpoints,
  dailyDataField: `${DAILY_VOLUME_FACTORY}s`,
  volumeField: DAILY_VOLUME_FIELD,
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

const adapter: SimpleVolumeAdapter = {
  volume,
};
export default adapter;

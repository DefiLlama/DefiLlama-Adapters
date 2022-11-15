import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { getStartTimestamp } from "../../helper/getStartTimestamp";
import {
  DEFAULT_DAILY_VOLUME_FIELD,
  DEFAULT_TOTAL_VOLUME_FIELD,
  getChainVolume,
} from "../../helper/getUniSubgraphVolume";
import { CHAIN } from "../../helper/chains";

const endpoints = {
  [CHAIN.ARBITRUM]:
    "https://api.thegraph.com/subgraphs/name/0xleez/xcali-arbitrum",
};

const graphs = getChainVolume({
  graphUrls: endpoints,
  totalVolume: {
    factory: "swapFactories",
    field: DEFAULT_TOTAL_VOLUME_FIELD,
  },
  dailyVolume: {
    factory: "pairDayData",
    field: DEFAULT_DAILY_VOLUME_FIELD,
  },
});

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.ARBITRUM]: {
      fetch: graphs(CHAIN.ARBITRUM),
      start: getStartTimestamp({
        endpoints: endpoints,
        chain: CHAIN.ARBITRUM,
        volumeField: DEFAULT_DAILY_VOLUME_FIELD,
        dailyDataField: "pairDayDatas",
      }),
    },
  },
};

export default adapter;

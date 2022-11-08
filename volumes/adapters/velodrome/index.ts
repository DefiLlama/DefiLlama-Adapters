import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { getStartTimestamp } from "../../helper/getStartTimestamp";
import { DEFAULT_DAILY_VOLUME_FIELD, DEFAULT_TOTAL_VOLUME_FIELD, getChainVolume } from "../../helper/getUniSubgraphVolume";
import { CHAIN } from "../../helper/chains";

const endpoints = {
  [CHAIN.OPTIMISM]: "https://api.thegraph.com/subgraphs/name/dmihal/velodrome",
};

const graphs = getChainVolume({
  graphUrls: endpoints,
  totalVolume: {
    factory: "factories",
    field: DEFAULT_TOTAL_VOLUME_FIELD,
  },
  dailyVolume: {
    factory: "dayData",
    field: DEFAULT_DAILY_VOLUME_FIELD,
  },
});

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.OPTIMISM]: {
      fetch: graphs(CHAIN.OPTIMISM),
      start: getStartTimestamp({
        endpoints: endpoints,
        chain: CHAIN.OPTIMISM,
        volumeField: DEFAULT_DAILY_VOLUME_FIELD,
        dailyDataField: "dayDatas"
      })
    },
  },
};

export default adapter;

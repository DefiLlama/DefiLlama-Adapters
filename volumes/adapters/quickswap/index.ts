import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import { getStartTimestamp } from "../../helper/getStartTimestamp";
import { DEFAULT_TOTAL_VOLUME_FIELD, getChainVolume } from "../../helper/getUniSubgraphVolume";

const endpoints = {
  [CHAIN.POLYGON]: "https://api.thegraph.com/subgraphs/name/sameepsi/quickswap-v3",
};

const graphs = getChainVolume({
  graphUrls: endpoints,
  totalVolume: {
    factory: "factories",
    field: DEFAULT_TOTAL_VOLUME_FIELD,
  },
  dailyVolume: {
    factory: "algebraDayData",
    field: 'volumeUSD',
  },
});

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.POLYGON]: {
      fetch: graphs(CHAIN.POLYGON),
      start: getStartTimestamp({
        endpoints: endpoints,
        chain: CHAIN.POLYGON,
        volumeField: 'volumeUSD',
        dailyDataField: 'algebraDayDatas'
      })
    },
  },
};

export default adapter;

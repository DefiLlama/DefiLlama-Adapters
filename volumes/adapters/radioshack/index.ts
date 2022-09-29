import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { CHAIN } from "../../helper/chains";
import { getStartTimestamp } from "../../helper/getStartTimestamp";
import { DEFAULT_DAILY_VOLUME_FACTORY, DEFAULT_DAILY_VOLUME_FIELD, DEFAULT_TOTAL_VOLUME_FACTORY, DEFAULT_TOTAL_VOLUME_FIELD, getChainVolume } from "../../helper/getUniSubgraphVolume";

const endpoints = {
  [CHAIN.POLYGON]: "https://api.thegraph.com/subgraphs/name/radioshackcreator/unigraph-polygon",
  [CHAIN.BSC]: "https://api.thegraph.com/subgraphs/name/radioshackcreator/unigraph-bsc",
  [CHAIN.ETHEREUM]: "https://api.thegraph.com/subgraphs/name/radioshackcreator/unigraph-ethereum",
  [CHAIN.AVAX]: "https://api.thegraph.com/subgraphs/name/radioshackcreator/unigraph-avalanche",
  [CHAIN.FANTOM]: "https://api.thegraph.com/subgraphs/name/radioshackcreator/unigraph-fantom",
};

const graphs = getChainVolume({
  graphUrls: endpoints,
  totalVolume: {
    factory: DEFAULT_TOTAL_VOLUME_FACTORY,
    field: DEFAULT_TOTAL_VOLUME_FIELD,
  },
  dailyVolume: {
    factory: DEFAULT_DAILY_VOLUME_FACTORY,
    field: DEFAULT_DAILY_VOLUME_FIELD,
  },
});

const adapter: SimpleVolumeAdapter = {
  volume: {
    [CHAIN.POLYGON]: {
      fetch: graphs(CHAIN.POLYGON),
      start: getStartTimestamp({
        endpoints: endpoints,
        chain: CHAIN.POLYGON,
        volumeField: DEFAULT_DAILY_VOLUME_FIELD,
        dailyDataField: `${DEFAULT_DAILY_VOLUME_FACTORY}s`
      })
    },
    [CHAIN.BSC]: {
      fetch: graphs(CHAIN.BSC),
      start: getStartTimestamp({
        endpoints: endpoints,
        chain: CHAIN.BSC,
        volumeField: DEFAULT_DAILY_VOLUME_FIELD,
        dailyDataField: `${DEFAULT_DAILY_VOLUME_FACTORY}s`
      })
    },
    [CHAIN.ETHEREUM]: {
      fetch: graphs(CHAIN.ETHEREUM),
      start: getStartTimestamp({
        endpoints: endpoints,
        chain: CHAIN.ETHEREUM,
        volumeField: DEFAULT_DAILY_VOLUME_FIELD,
        dailyDataField: `${DEFAULT_DAILY_VOLUME_FACTORY}s`
      })
    },
    [CHAIN.AVAX]: {
      fetch: graphs(CHAIN.AVAX),
      start: getStartTimestamp({
        endpoints: endpoints,
        chain: CHAIN.AVAX,
        volumeField: DEFAULT_DAILY_VOLUME_FIELD,
        dailyDataField: `${DEFAULT_DAILY_VOLUME_FACTORY}s`
      })
    },
    [CHAIN.FANTOM]: {
      fetch: graphs(CHAIN.FANTOM),
      start: getStartTimestamp({
        endpoints: endpoints,
        chain: CHAIN.FANTOM,
        volumeField: DEFAULT_DAILY_VOLUME_FIELD,
        dailyDataField: `${DEFAULT_DAILY_VOLUME_FACTORY}s`
      })
    },
  },
};

export default adapter;

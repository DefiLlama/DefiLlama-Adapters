import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { getStartTimestamp } from "../../helper/getStartTimestamp";
import { getChainVolume } from "../../helper/getUniSubgraphVolume";

const endpoints = {
  avax: "https://api.thegraph.com/subgraphs/name/traderjoe-xyz/exchange",
};

const graphs = getChainVolume({
  graphUrls: {
    avax: endpoints.avax,
  },
  totalVolume: {
    factory: "factories",
    field: "volumeUSD",
  },
  dailyVolume: {
    factory: "dayData",
    field: "volumeUSD",
  },
});

const adapter: SimpleVolumeAdapter = {
  volume: {
    avax: {
      fetch: graphs("avax"),
      start: getStartTimestamp({
        endpoints: endpoints,
        chain: "avax",
        volumeField: "volumeUSD",
        dailyDataField: "dayDatas"
      })
    },
  },
};

export default adapter;

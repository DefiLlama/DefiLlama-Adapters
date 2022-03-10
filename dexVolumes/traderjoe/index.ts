import { DexVolumeAdapter } from "../dexVolume.type";

const { getChainVolume } = require("../helper/getUniSubgraphVolume");

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

const adapter: DexVolumeAdapter = {
  volume: {
    avax: {
      fetch: graphs("avax"),
      start: 1628467200,
    },
  },
};

export default adapter;

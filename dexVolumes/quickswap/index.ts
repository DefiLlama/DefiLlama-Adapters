import { DexVolumeAdapter } from "../dexVolume.type";

const { getChainVolume } = require("../helper/getUniSubgraphVolume");

const endpoints = {
  polygon: "https://api.thegraph.com/subgraphs/name/sameepsi/quickswap05",
};

const graphs = getChainVolume({
  graphUrls: {
    polygon: endpoints.polygon,
  },
});

const adapter: DexVolumeAdapter = {
  volume: {
    polygon: {
      fetch: graphs("polygon"),
      start: 1602115200,
    },
  },
};

export default adapter;

import { DexVolumeAdapter } from "../dexVolume.type";

const { getChainVolume } = require("../helper/getUniSubgraphVolume");
const { FANTOM } = require("../helper/chains");
const endpoints = {
  [FANTOM]: "https://api.thegraph.com/subgraphs/name/eerieeight/spookyswap",
};

const graphs = getChainVolume({
  graphUrls: {
    [FANTOM]: endpoints[FANTOM],
  },
});

const adapter: DexVolumeAdapter = {
  volume: {
    [FANTOM]: {
      fetch: graphs(FANTOM),
      start: 1618617600,
    },
  },
};

export default adapter;

import { DexVolumeAdapter } from "../dexVolume.type";

const { getChainVolume } = require("../helper/getUniSubgraphVolume");
const { CANDLE } = require("../helper/chains");
const endpoints = {
  [CANDLE]: "https://thegraph.cndlchain.com/subgraphs/name/ianlapham/uniswap-v3-test",
};

const graphs = getChainVolume({
  graphUrls: {
    [CANDLE]: endpoints[CANDLE],
  },
});

const adapter: DexVolumeAdapter = {
  volume: {
    [CANDLE]: {
      fetch: graphs(CANDLE),
      start: 1618617600,
    },
  },
};

export default adapter;

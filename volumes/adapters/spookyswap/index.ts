import { SimpleVolumeAdapter } from "../../dexVolume.type";
import { getStartTimestamp } from "../../helper/getStartTimestamp";

const { getChainVolume } = require("../../helper/getUniSubgraphVolume");
const { FANTOM } = require("../../helper/chains");
const endpoints = {
  [FANTOM]: "https://api.thegraph.com/subgraphs/name/eerieeight/spookyswap",
};

const graphs = getChainVolume({
  graphUrls: {
    [FANTOM]: endpoints[FANTOM],
  },
});

const adapter: SimpleVolumeAdapter = {
  volume: {
    [FANTOM]: {
      fetch: graphs(FANTOM),
      start: getStartTimestamp({
        endpoints,
        chain: FANTOM
      }),
    },
  },
};

export default adapter;

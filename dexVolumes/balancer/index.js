const { getChainVolume } = require("../helper/getUniSubgraphVolume");
const { ARBITRUM, ETHEREUM, POLYGON } = require("../helper/chains");
const { getStartTimestamp } = require("../helper/getStartTimestamp");
const { getBlock } = require("../helper/getBlock");
const { ethereum } = require("../../projects/balancer");

const endpoints = {
  [ETHEREUM]: "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer",
  [POLYGON]:
    "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-polygon-v2",
  [ARBITRUM]:
    "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-arbitrum-v2",
};

const graphs = getChainVolume({
  graphUrls: {
    [ETHEREUM]: endpoints[ETHEREUM],
    [POLYGON]: endpoints[POLYGON],
    [ARBITRUM]: endpoints[ARBITRUM],
  },
  totalVolume: {
    factory: "balancers",
    field: "totalSwapVolume",
  },
  hasDailyVolume: false,
});

// const ethStart = getBlock(9747796, ethereum);

module.exports = {
  volume: {
    [ETHEREUM]: {
      fetch: graphs(ETHEREUM),
      start: 0,
      customBackfill: () => {},
    },
    // POLYGON

    // ARBITRUM
  },
};

// TODO custom backfill have to get specific block at start of each day

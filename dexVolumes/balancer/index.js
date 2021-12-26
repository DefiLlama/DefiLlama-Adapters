const { getChainVolume } = require("../helper/getUniSubgraphVolume");

const endpoints = {
  ethereum: "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer",
  polygon:
    "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-polygon-v2",
  arbitrum:
    "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-arbitrum-v2",
};

const graphs = getChainVolume({
  graphUrls: {
    ethereum: endpoints.ethereum,
    polygon: endpoints.polygon,
    arbitrum: endpoints.arbitrum,
  },
  totalVolume: {
    factory: "balancers",
    field: "totalSwapVolume",
  },
  hasDailyVolume: false,
});

module.exports = {
  ethereum: graphs("ethereum"),
};

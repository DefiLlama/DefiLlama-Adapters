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

module.exports = {
  volume: {
    avax: graphs("avax"),
  },
};

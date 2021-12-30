const { getChainVolume } = require("../helper/getUniSubgraphVolume");

const endpoints = {
  polygon: "https://api.thegraph.com/subgraphs/name/sameepsi/quickswap05",
};

const graphs = getChainVolume({
  graphUrls: {
    polygon: endpoints.polygon,
  },
});

module.exports = {
  volume: {
    polygon: graphs("polygon"),
  },
};

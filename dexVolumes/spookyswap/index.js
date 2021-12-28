const {
  getChainVolume,
  DEFAULT_TOTAL_VOLUME_FIELD,
  DEFAULT_DAILY_VOLUME_FIELD,
} = require("../helper/getUniSubgraphVolume");

const endpoints = {
  fantom: "https://api.thegraph.com/subgraphs/name/eerieeight/spookyswap",
};

const graphs = getChainVolume({
  graphUrls: {
    fantom: endpoints.fantom,
  },
});

module.exports = {
  fantom: graphs("fantom"),
};

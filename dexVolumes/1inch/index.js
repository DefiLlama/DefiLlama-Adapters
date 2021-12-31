const {
  getChainVolume,
  DEFAULT_TOTAL_VOLUME_FIELD,
  DEFAULT_DAILY_VOLUME_FIELD,
} = require("../helper/getUniSubgraphVolume");

const endpoints = {
  ethereum:
    "https://api.thegraph.com/subgraphs/name/1inch-exchange/oneinch-liquidity-protocol-v2",
};
const graphs = getChainVolume({
  graphUrls: {
    ethereum: endpoints.ethereum,
  },
  totalVolume: {
    factory: "mooniswapFactories",
    field: DEFAULT_TOTAL_VOLUME_FIELD,
  },
  dailyVolume: {
    factory: "mooniswapDayData",
    field: DEFAULT_DAILY_VOLUME_FIELD,
  },
});

module.exports = {
  volume: {
    ethereum: graphs("ethereum"),
  },
};

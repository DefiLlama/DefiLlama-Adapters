const { getChainVolume } = require("../helper/getUniSubgraphVolume");

const endpoints = {
  ethereum: "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2",
  bsc: "https://pq.hg.network/subgraphs/name/dodoex-v2-bsc/bsc",
  heco: "https://q.hg.network/subgraphs/name/dodoex/heco",
  polygon: "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-polygon",
  arbitrum: "https://api.thegraph.com/subgraphs/name/dodoex/dodoex-v2-arbitrum",
};

const graphs = getChainVolume({
  graphUrls: {
    ethereum: endpoints.ethereum,
    bsc: endpoints.bsc,
    heco: endpoints.heco,
    polygon: endpoints.polygon,
    arbitrum: endpoints.arbitrum,
  },
  totalVolume: {
    factory: "dodoZoos",
    field: "volumeUSD",
  },
  dailyVolume: {
    factory: "dodoDayData",
    field: "volumeUSD",
  },
});

module.exports = {
  ethereum: graphs("ethereum"),
  bsc: graphs("bsc"),
  heco: graphs("heco"),
  polygon: graphs("polygon"),
  arbitrum: graphs("arbitrum"),
};

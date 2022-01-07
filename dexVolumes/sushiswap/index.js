const { getChainVolume } = require("../helper/getUniSubgraphVolume");

const endpoints = {
  ethereum: "https://api.thegraph.com/subgraphs/name/sushiswap/exchange",
  xdai: "https://api.thegraph.com/subgraphs/name/sushiswap/xdai-exchange",
  polygon: "https://api.thegraph.com/subgraphs/name/sushiswap/matic-exchange",
  fantom: "https://api.thegraph.com/subgraphs/name/sushiswap/fantom-exchange",
  bsc: "https://api.thegraph.com/subgraphs/name/sushiswap/bsc-exchange",
  harmony:
    "https://sushi.graph.t.hmny.io/subgraphs/name/sushiswap/harmony-exchange",
  //'okexchain': 'https://q.hg.network/subgraphs/name/sushiswap/okex-exchange',
  avax: "https://api.thegraph.com/subgraphs/name/sushiswap/avalanche-exchange",
  celo: "https://api.thegraph.com/subgraphs/name/sushiswap/celo-exchange",
  arbitrum:
    "https://api.thegraph.com/subgraphs/name/sushiswap/arbitrum-exchange",
  //'okexchain': 'https://q.hg.network/subgraphs/name/okex-exchange/oec',
  heco: "https://q.hg.network/subgraphs/name/heco-exchange/heco",
};

const graphs = getChainVolume({
  graphUrls: {
    ethereum: endpoints.ethereum,
    xdai: endpoints.xdai,
    polygon: endpoints.polygon,
    fantom: endpoints.xdai,
    bsc: endpoints.bsc,
    harmony: endpoints.harmony,
    avax: endpoints.avax,
    celo: endpoints.celo,
    arbitrum: endpoints.arbitrum,
    heco: endpoints.heco,
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
    ethereum: graphs("ethereum"),
    xdai: graphs("xdai"),
    polygon: graphs("polygon"),
    // Will have to replace with faster indexer
    fantom: graphs("fantom"),
    bsc: graphs("bsc"),
    harmony: graphs("harmony"),
    avax: graphs("avax"),
    celo: graphs("celo"),
    // Will have to replace with faster indexer
    arbitrum: graphs("arbitrum"),
    // Heco currently returning 0
    heco: graphs("heco"),
  },
};

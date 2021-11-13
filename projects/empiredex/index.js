const { getChainTvl } = require("../helper/getUniSubgraphTvl");
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

const graphUrls = {
  //bsc: "https://api.thegraph.com/subgraphs/name/trnhgquan/empiredexbsc",
  //xdai: "https://api.thegraph.com/subgraphs/name/zikyfranky/empire-xdai",
  //polygon: "https://api.thegraph.com/subgraphs/name/zikyfranky/empire-polygon",
  //fantom: "https://api.thegraph.com/subgraphs/name/zikyfranky/empire-exchange",
  //avax: "https://api.thegraph.com/subgraphs/name/zikyfranky/empire-subgraph-avax",
};

const chainTvl = getChainTvl(graphUrls, "uniswapFactories");

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: calculateUsdUniTvl(
      "0x06530550A48F990360DFD642d2132354A144F31d",
      "bsc",
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
      [
        "0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82",
        "0x2170ed0880ac9a755fd29b2688956bd959f933f8",
        "0x55d398326f99059ff775485246999027b3197955",
        "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c",
      ],
      "wbnb"
    ),
  },
  cronos: {
    tvl: calculateUsdUniTvl(
      "0x06530550A48F990360DFD642d2132354A144F31d",
      "cronos",
      "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
      [
        "0xc83859C413a6bA5ca1620cD876c7E33a232c1C34"
      ],
      "crypto-com-chain"
    ),
  },
  xdai: {
    tvl: calculateUsdUniTvl(
      "0x06530550A48F990360DFD642d2132354A144F31d",
      "xdai",
      "0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d",
      [
        "0xc83859C413a6bA5ca1620cD876c7E33a232c1C34"
      ],
      "xdai"
    ),
  },
  polygon: {
    tvl: calculateUsdUniTvl(
      "0x06530550A48F990360DFD642d2132354A144F31d",
      "polygon",
      "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
      [
        "0xc83859C413a6bA5ca1620cD876c7E33a232c1C34"
      ],
      "matic-network"
    ),
  },
  fantom: {
    tvl: calculateUsdUniTvl(
      "0x06530550A48F990360DFD642d2132354A144F31d",
      "fantom",
      "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83",
      [
        "0xc83859C413a6bA5ca1620cD876c7E33a232c1C34",
        "0x04068da6c83afcfa0e13ba15a6696662335d5b75"
      ],
      "fantom"
    ),
  },
  avax: {
    tvl: calculateUsdUniTvl(
      "0x06530550A48F990360DFD642d2132354A144F31d",
      "avax",
      "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      [
        "0xc83859C413a6bA5ca1620cD876c7E33a232c1C34"
      ],
      "avalanche-2"
    ),
  },
  
  methodology: "Factory address(0x06530550A48F990360DFD642d2132354A144F31d) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
};

const { getChainTvl } = require("../helper/getUniSubgraphTvl");
const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

const graphUrls = {
  //bsc: "https://api.thegraph.com/subgraphs/name/trnhgquan/empiredexbsc",
  xdai: "https://api.thegraph.com/subgraphs/name/zikyfranky/empire-xdai",
  polygon: "https://api.thegraph.com/subgraphs/name/zikyfranky/empire-polygon",
  fantom: "https://api.thegraph.com/subgraphs/name/zikyfranky/empire-exchange",
  avax: "https://api.thegraph.com/subgraphs/name/zikyfranky/empire-subgraph-avax",
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
  xdai: {
    tvl: chainTvl("xdai"),
  },
  polygon: {
    tvl: chainTvl("polygon"),
  },
  fantom: {
    tvl: chainTvl("fantom"),
  },
  avax: {
    tvl: chainTvl("avax"),
  },
  tvl: async () => ({}),
  methodology: "Liquidity on the DEX, data comes from their subgraphs. Factory address on bsc (0x06530550A48F990360DFD642d2132354A144F31d) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
};

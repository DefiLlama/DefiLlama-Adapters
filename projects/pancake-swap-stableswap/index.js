const { getChainTvl } = require("../helper/getUniSubgraphTvl");

const stableGraph = getChainTvl(
  {
    bsc: "https://api.thegraph.com/subgraphs/name/pancakeswap/exchange-stableswap",
  },
  "factories"
);


module.exports = {
  misrepresentedTokens: true,
  methodology:
    "TVL accounts for the liquidity on all StableSwap pools, using the TVL chart on https://pancakeswap.finance/info?type=stableSwap as the source.",
  bsc: {
    tvl: stableGraph("bsc", true),
  },
};

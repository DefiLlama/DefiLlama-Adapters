const { getChainTvl } = require("../helper/getUniSubgraphTvl");

const chainTvl = getChainTvl({
  polygon:
    "https://api.thegraph.com/subgraphs/name/akashzeromile/smartdex-subgraph",
});

module.exports = {
  misrepresentedTokens: true,
  polygon: {
    tvl: chainTvl("polygon"),
  },
  methodology: "Liquidity on the Farm, data comes from their subgraphs. TVL is equal to the liquidity on the AMM.",
};

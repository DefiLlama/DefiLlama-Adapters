const { getChainTvl } = require("../helper/getUniSubgraphTvl");

const v2graph = getChainTvl({
  pulsechain: "https://graph.pulsechain.com/subgraphs/name/pulsechain/pulsex",
});

module.exports = {
  misrepresentedTokens: true,
  methodology: `Counts the tokens locked on AMM pools, pulling the data from the 'pulsechain/pulsex' subgraph`,
  pulsechain: {
    tvl: v2graph("pulsechain"),
  },
};

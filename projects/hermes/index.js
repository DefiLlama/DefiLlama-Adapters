const sdk = require("@defillama/sdk");
const { getChainTvl } = require("../helper/getUniSubgraphTvl");
const graphUrls = {
  harmony: "https://graph.hermesdefi.io/subgraphs/name/exchange",
};

module.exports = {
  timetravel: true,
  doublecounted: false,
  misrepresentedTokens: true,
  methodology:
    'We calculate liquidity on all pairs with data retreived from the "hermes-defi/hermes-graph" subgraph.',
  harmony: {
    tvl: sdk.util.sumChainTvls([
      getChainTvl(graphUrls, "factories", "liquidityUSD")("harmony"),
    ]),
  },
};

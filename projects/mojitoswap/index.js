const { getChainTvl } = require("./utils");

const graphUrls = {
  kcc: "https://thegraph.kcc.network/subgraphs/name/mojito/swap",
};

const chainTvl = getChainTvl(graphUrls);

module.exports = {
  misrepresentedTokens: true,
  methodology: "We count liquidity on the dexes, pulling data from subgraphs",
  kcc: {
    tvl: chainTvl("kcc"),
  },
  tvl: chainTvl("kcc"),
};

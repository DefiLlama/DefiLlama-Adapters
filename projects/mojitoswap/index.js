const { MJT_GRAPH } = require("./query");
const { getChainTvl, getStakeLockValue } = require("./utils");

const graphUrls = {
  kcc: MJT_GRAPH,
};

const chainTvl = getChainTvl(graphUrls);
const stakeValue = getStakeLockValue();

module.exports = {
  misrepresentedTokens: true,
  methodology: "We count liquidity on the dexes, pulling data from subgraphs",
  kcc: {
    tvl: chainTvl("kcc"),
    staking: stakeValue,
  },
  tvl: chainTvl("kcc"),
  staking: stakeValue,
};

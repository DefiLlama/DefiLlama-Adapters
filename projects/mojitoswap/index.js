const { MJT_GRAPH, KCC_BLOCK_GRAPH } = require("./query");
const { getChainTvl, getStakeLockValue } = require("./utils");
const { staking } = require("../helper/staking.js");

const graphUrls = {
  kcc: MJT_GRAPH,
};

const chainTvl = getChainTvl(graphUrls);
const stakingValue = getStakeLockValue();

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "We count liquidity and staking on the dexes, pulling data from subgraphs",
  kcc: {
    tvl: chainTvl("kcc"),
    staking: stakingValue(),
  },
  start: 3000000,
  timetravel: true,
};

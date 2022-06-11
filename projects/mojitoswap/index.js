const { getChainTvl, getStakeLockValue } = require("./utils");

const MJT_GRAPH = "https://thegraph.kcc.network/subgraphs/name/mojito/swap";
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
  timetravel: false,
};

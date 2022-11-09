const { tvl, staking } = require("./tvl");

const START_BLOCK = 903029;

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  start: START_BLOCK,
  astar: {
    tvl,
    staking,
  },
};

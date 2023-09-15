const { tvl, staking } = require("./tvl");

const START_BLOCK = 903029;

module.exports = {
  misrepresentedTokens: true,
  start: START_BLOCK,
  astar: {
    tvl,
    staking,
  },
};

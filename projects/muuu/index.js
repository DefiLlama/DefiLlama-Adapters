const { tvl } = require("./tvl");

const START_BLOCK = 903029;

module.exports = {
  timetravel: true,
  start: START_BLOCK,
  astar: {
    tvl,
  },
};

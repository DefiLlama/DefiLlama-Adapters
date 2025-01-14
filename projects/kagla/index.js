const { getBalances } = require("./pools");
const { VOTING_ESCROW_ADDRESS, KGL_ADDRESS,  } = require("./addresses");
const { staking } = require('../helper/staking')

const START_BLOCK = 724359

async function astar(api) {
  return getBalances(api)
}

module.exports = {
  start: START_BLOCK,
  astar: {
    tvl: astar,
    staking: staking(VOTING_ESCROW_ADDRESS, KGL_ADDRESS)
  },
};

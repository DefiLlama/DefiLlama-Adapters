const { staking } = require("../helper/staking");
const utils = require("../helper/utils");

async function astar() {
  let staked = await utils.fetchURL("https://api.kagla.finance/api/kagla/tvl"); //stable pools
  return staked.data.tvl;
}

function fetch() {
  return astar();
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  astar: {
    fetch: astar,
  },
  fetch,
};

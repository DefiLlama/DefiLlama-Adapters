const { getBalances } = require("./pools");

const START_BLOCK = 724359

async function astar(_timestamp, _block, {astar: block}) {
  const chain = "astar"
  const balances = await getBalances(chain, block)
  return balances
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  start: START_BLOCK,
  astar: {
    tvl: astar,
  },
};

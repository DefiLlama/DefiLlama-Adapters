const { getBalances } = require("./pools");
const { getStaked } = require("./staking");

const START_BLOCK = 724359

async function astar(_timestamp, _block, {astar: block}) {
  const chain = "astar"
  const balances = await getBalances(chain, block)
  return balances
}

async function staking(_timestamp, _block, {astar: block}) {
  const chain = "astar"
  const staked = await getStaked(chain, block)
  return staked
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  start: START_BLOCK,
  astar: {
    tvl: astar,
    staking: staking
  },
};

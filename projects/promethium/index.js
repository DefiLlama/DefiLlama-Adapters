const profitablePools = require("./profitablePools");
const chain = "arbitrum";
const { pools } = require("./pool-constants");

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  const baseOptions = { balances, chainBlocks };

  await profitablePools.sumTvl({
    ...baseOptions,
    pools: filterActivePools(pools, block),
  });
  return balances;
}

// Returns only deployed pools on the block number {blockHeight}

function filterActivePools(pools, blockHeight) {
  return pools
    .filter((pool) => pool.startBlock <= blockHeight)
    .map((pool) => pool.id);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  methodology:
    "TVL displays the total amount of assets stored in the Promethium contracts, excluding not claimed fees.",
  start: 1696164866,
  arbitrum: { tvl },
  hallmarks: [[1696164866, "Profitable pools deployment"]],
};

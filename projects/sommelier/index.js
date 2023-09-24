const v0815 = require("./v0-8-15");
const v0816 = require("./v0-8-16");
const v2 = require("./v2");
const chain = "ethereum";
const { cellarsV0815, cellarsV0816, cellarsV2, cellarsV2p5 } = require("./cellar-constants");


async function tvl(timestamp, block, chainBlocks, { api }) {
  const balances = {};
  const baseOptions = { balances, chainBlocks };

  // Sum TVL for all v0.8.15 Cellars
  await v0815.sumTvl({
    ...baseOptions,
    cellars: filterActiveCellars(cellarsV0815, block),
  });

  // Sum TVL for all v0.8.16 Cellars
  await v0816.sumTvl({
    ...baseOptions,
    cellars: filterActiveCellars(cellarsV0816, block),
  });

  await v2.sumTvl({
    ...baseOptions,
    api,
    cellars: filterActiveCellars(cellarsV2, block),
  });

  // no change in sumTvl implementation from v2 to v2.5
  await v2.sumTvl({
    ...baseOptions,
    api,
    cellars: filterActiveCellars(cellarsV2p5, block),
  });

  return balances;
}

// Returns list of cellar addresses that are deployed based on their start block
function filterActiveCellars(cellars, blockHeight) {
  return cellars
    .filter((cellar) => cellar.startBlock <= blockHeight)
    .map((cellar) => cellar.id);
}

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    "TVL is calculated as the sum of deposits invested into the strategy, deposits waiting to be invested, and yield waiting to be reinvested or redistributed across all Cellars.",
  start: 1656652494,
  [chain]: { tvl },
  hallmarks: [
    [1658419200, "aave2 Cellar Launch"],
    [1674671068, "Real Yield USD Cellar Launch"],
    [1681233049, "Real Yield ETH Cellar Launch"],
    [1689271200, "Real Yield BTC Cellar Launch"],
  ],
};

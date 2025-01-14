const v0815 = require("./v0-8-15");
const v0816 = require("./v0-8-16");
const v2 = require("./v2");
const {
  cellarsV0815,
  cellarsV0816,
  cellarsV2,
  cellarsV2p5,
  arbitrumCellarsV2p5,
  optimismCellarsV2p5,
} = require("./cellar-constants");


async function ethereum_tvl(api) {
  const block = await api.getBlock();
  // Sum TVL for all v0.8.15 Cellars
  await v0815.sumTvl({
    api,
    cellars: filterActiveCellars(cellarsV0815, block),
  });

  // Sum TVL for all v0.8.16 Cellars
  await v0816.sumTvl({
    api,
    cellars: filterActiveCellars(cellarsV0816, block),
  });

  await v2.sumTvl({
    api,
    cellars: filterActiveCellars(cellarsV2, block),
    ownersToDedupe: cellarsV2.concat(cellarsV2p5),
  });

  // no change in sumTvl implementation from v2 to v2.5
  await v2.sumTvl({
    api,
    cellars: filterActiveCellars(cellarsV2p5, block),
    ownersToDedupe: cellarsV2.concat(cellarsV2p5),
  });
}

async function arbitrum_tvl(api) {
  await v2.sumTvl({
    api,
    cellars: arbitrumCellarsV2p5.map((cellar) => cellar.id),
    ownersToDedupe: arbitrumCellarsV2p5,
  });
}

async function optimism_tvl(api) {
  await v2.sumTvl({
    api,
    cellars: optimismCellarsV2p5.map((cellar) => cellar.id),
    ownersToDedupe: optimismCellarsV2p5,
  });
}

// Returns list of cellar addresses that are deployed based on their start block
function filterActiveCellars(cellars, block) {
  return cellars
    .filter((cellar) => cellar.startBlock <= block)
    .map((cellar) => cellar.id);
}

module.exports = {
      methodology:
    "TVL is calculated as the sum of deposits invested into the strategy, deposits waiting to be invested, and yield waiting to be reinvested or redistributed across all Cellars.",
  start: '2022-07-01',
  ["ethereum"]: { tvl: ethereum_tvl },
  ["arbitrum"]: { tvl: arbitrum_tvl },
  ["optimism"]: { tvl: optimism_tvl },
  hallmarks: [
    [1658419200, "aave2 Cellar Launch"],
    [1674671068, "Real Yield USD Cellar Launch"],
    [1681233049, "Real Yield ETH Cellar Launch"],
    [1689271200, "Real Yield BTC Cellar Launch"],
  ],
};

const abiCellarV0815 = {
  "asset": "address:asset",
  "totalAssets": "uint256:totalAssets",
  "totalHoldings": "uint256:totalHoldings",
  "totalLocked": "uint256:totalLocked",
  "maxLocked": "uint256:maxLocked"
};
const abiCellarV0816 = {
  "holdingPosition": "address:holdingPosition",
  "getPositions": "address[]:getPositions",
  "totalAssets": "uint256:totalAssets"
};

const v0815 = {
  async sumTvl(options) {
    const { cellars } = options;

    // Log TVL for each v0.8.15 cellar
    for (const cellar of cellars) {
      await logCellarTvl(cellar, options);
    }
  },
};

// target: string, cellar contract address
async function logCellarTvl(target, { api }) {

  // TVL for the v0.8.15 cellars is the sum of:
  // totalAssets (assets invested into the underlying)
  // totalHoldings (assets deposited into the strategy but uninvested)
  // maxLocked (yield waiting to be distributed and reinvested)
  const totalAssets = await api.call({ abi: abiCellarV0815.totalAssets, target, })
  const totalHoldings = await api.call({ abi: abiCellarV0815.totalHoldings, target, })
  const maxLocked = await api.call({ abi: abiCellarV0815.maxLocked, target, })

  // Asset is the underlying ERC20 the cellar is invested in and is accepted for deposit
  // This can change as the cellar chases the underlying pool with the highest yield
  const assetAddress = await api.call({ abi: abiCellarV0815.asset, target, })

  // Sum up total assets, holdings, and locked yield
  api.add(assetAddress, [totalAssets, totalHoldings, maxLocked])
}

const v0816 = {
  async sumTvl(options) {
    const { cellars, api } = options;
    // TVL is the value of each of the Cellar's positions summed up
    const positions = await api.multiCall({  abi: abiCellarV0816.getPositions, calls: cellars})
    const ownerTokens = positions.map((position, i)=>[position, cellars[i]])
    return api.sumTokens({ ownerTokens })
  },
};

const v2 = {
  async sumTvl({ cellars, api, ownersToDedupe }) {

    const assets = await api.multiCall({
      abi: "address:asset",
      calls: cellars,
    });
    const bals = await api.multiCall({
      abi: "uint256:totalAssets",
      calls: cellars,
    });

    // Dedupe any potential TVL of cellars taking positions in other cellars by looking at balanceOf for each cellar

    const sharesToIgnore = await Promise.all(
      cellars.map(async (target) => {
        // Iterate over all owners and sum up their shares for each cellar (target)
        const shares = await api.multiCall({
          calls: ownersToDedupe.map((owner) => ({
            target: target, // Base Cellar
            params: [owner.id], // Potential cellar holding shares in base cellar
          })),
          abi: "erc20:balanceOf",
        });

        // Sum up all shares for each cellar (target)
        const totalShares = shares.reduce(
          (sum, share) => sum + Number(share),
          0
        );

        return totalShares;
      })
    );

    // Create a new map of total shares by using totalSupply
    let totalShares = await api.multiCall({
      calls: cellars.map((cellar) => ({
        target: cellar, // Base Cellar
      })),
      abi: "uint256:totalSupply",
    });
    // Clean up to be list of outputs
    totalShares = totalShares.map((share) => share);

    // Create a ratio of 1-(sharesToIgnore/totalShares) to multiply by the totalAssets
    const ratios = totalShares.map((share, i) => {
      const ratio = 1 - sharesToIgnore[i] / share;
      return ratio;
    });

    assets.forEach((a, i) => api.add(a, bals[i] * ratios[i]));
  },
};

const {
  cellarsV0815,
  cellarsV0816,
  cellarsV2,
  cellarsV2p5,
  arbitrumCellarsV2p5,
  optimismCellarsV2p5,
} = require("./cellar-constants");

const blacklistCellars = ['0x9a7b4980C6F0FCaa50CD5f288Ad7038f434c692e', '0x5195222f69c5821f8095ec565e71e18ab6a2298f', '0xdAdC82e26b3739750E036dFd9dEfd3eD459b877A', '0x1dffb366b5c5A37A12af2C127F31e8e0ED86BDbe']

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
    .filter((cellar) => cellar.startBlock <= block && !blacklistCellars.includes(cellar.id))
    .map((cellar) => cellar.id);
}

module.exports = {
  methodology: "TVL is calculated as the sum of deposits invested into the strategy, deposits waiting to be invested, and yield waiting to be reinvested or redistributed across all Cellars.",
  start: '2022-07-01',
  ["ethereum"]: { tvl: ethereum_tvl },
  ["arbitrum"]: { tvl: arbitrum_tvl },
  ["optimism"]: { tvl: optimism_tvl },
  hallmarks: [
    ['2022-07-21', "aave2 Cellar Launch"],
    ['2023-01-25', "Real Yield USD Cellar Launch"],
    ['2023-04-11', "Real Yield ETH Cellar Launch"],
    ['2023-07-13', "Real Yield BTC Cellar Launch"],
  ],
};

const ADDRESSES = require('../helper/coreAssets.json')

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

// These legacy Cellars are unwound into their base assets, but totalAssets()
// reverts because a zero/dust nested position depends on a stale oracle.
const oracleFailureCellars = [
  '0xb5b29320d2dde5ba5bafa1ebcd270052070483ec', // Real Yield ETH
  '0x4068bdd217a45f8f668ef19f1e3a1f043e4c4934', // Real Yield LINK
  '0x0274a704a6d9129f90a62ddc6f6024b33ecdad36', // Real Yield BTC
  '0x6c51041a91c91c86f3f08a72cb4d3f67f1208897', // ETH Trend Growth
  '0xc7372ab5dd315606db799246e8aa112405abaeff', // Turbo stETH (stETH Deposit)
]
const oracleFailureCellarSet = new Set(oracleFailureCellars)

async function splitOracleFailureCellars(api, cellars) {
  const candidates = cellars.filter(cellar => oracleFailureCellarSet.has(cellar.toLowerCase()))
  const totalAssets = await api.multiCall({
    abi: 'uint256:totalAssets',
    calls: candidates,
    permitFailure: true,
  })
  const fallbackSet = new Set(candidates
    .filter((_, i) => totalAssets[i] == null)
    .map(cellar => cellar.toLowerCase()))

  return {
    healthy: cellars.filter(cellar => !fallbackSet.has(cellar.toLowerCase())),
    fallback: cellars.filter(cellar => fallbackSet.has(cellar.toLowerCase())),
  }
}

async function sumDirectV2CellarAssets(api, cellars) {
  const assets = await api.multiCall({
    abi: 'function getPositionAssets() view returns (address[])',
    calls: cellars,
  })
  return api.sumTokens({ ownerTokens: cellars.map((cellar, i) => [assets[i], cellar]) })
}

async function sumDirectV2p5CellarAssets(api, cellars) {
  const assets = await api.multiCall({ abi: 'address:asset', calls: cellars })
  return api.sumTokens({
    ownerTokens: cellars.map((cellar, i) => [[assets[i], ADDRESSES.ethereum.WETH], cellar]),
  })
}

async function ethereum_tvl(api) {
  const block = await api.getBlock();
  const activeV2Cellars = filterActiveCellars(cellarsV2, block)
  const activeV2p5Cellars = filterActiveCellars(cellarsV2p5, block)
  const [v2Cellars, v2p5Cellars] = await Promise.all([
    splitOracleFailureCellars(api, activeV2Cellars),
    splitOracleFailureCellars(api, activeV2p5Cellars),
  ])
  const fallbackSet = new Set(v2Cellars.fallback
    .concat(v2p5Cellars.fallback)
    .map(cellar => cellar.toLowerCase()))

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
    cellars: v2Cellars.healthy,
    ownersToDedupe: cellarsV2.concat(cellarsV2p5),
  });

  // Count the fully unwound Cellars from their direct base-asset balances.
  // Their remaining nested Sommelier shares stay included in the underlying
  // Cellars below by excluding these owners from the share de-duplication.
  await sumDirectV2CellarAssets(api, v2Cellars.fallback)
  await sumDirectV2p5CellarAssets(api, v2p5Cellars.fallback)

  // no change in sumTvl implementation from v2 to v2.5
  await v2.sumTvl({
    api,
    cellars: v2p5Cellars.healthy,
    ownersToDedupe: cellarsV2
      .concat(cellarsV2p5)
      .filter(({ id }) => !fallbackSet.has(id.toLowerCase()))
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

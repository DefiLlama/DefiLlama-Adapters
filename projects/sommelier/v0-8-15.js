const abiCellarV0815 = require("./cellar-v0-8-15.json");

// type Options = {
//   cellars: string[], // list of cellar addresses
//   balances: Object, // balances object to accumulate protocol TVL
//   chainBlocks, // provided by DefiLlama SDK
// }
async function sumTvl(options) {
  const { cellars } = options;

  // Log TVL for each v0.8.15 cellar
  for (const cellar of cellars) {
    await logCellarTvl(cellar, options);
  }
}

// target: string, cellar contract address
// options: same as above
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

module.exports = {
  sumTvl,
};

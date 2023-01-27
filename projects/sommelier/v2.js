const sdk = require("@defillama/sdk");
const abiCellar = require("./cellar-v2.json");

const chain = "ethereum";

const getAsset = abiCellar.find((el) => el.name === "asset");
const getTotalAssets = abiCellar.find((el) => el.name === "totalAssets");

// type Options = {
//   cellars: string[], // list of cellar addresses
//   balances: Object, // balances object to accumulate protocol TVL
//   chainBlocks, // provided by DefiLlama SDK
// }
async function sumTvl(options) {
  const { balances, cellars, chainBlocks } = options;

  for (const cellar of cellars) {
    // The holding position of deposited funds
    const assetAddress = (
      await sdk.api.abi.call({
        chain,
        abi: getAsset,
        target: cellar,
      })
    ).output;

    // Total amount of deposits and gains held by the cellar
    // denoted in terms of the holding position.
    const totalAssets = (
      await sdk.api.abi.call({
        chain,
        abi: getTotalAssets,
        target: cellar,
      })
    ).output;

    sdk.util.sumSingleBalance(
      balances,
      `${chain}:${assetAddress}`,
      totalAssets
    );
  }
}

module.exports = {
  sumTvl,
};

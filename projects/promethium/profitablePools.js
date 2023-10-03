const sdk = require("@defillama/sdk");
const abiProfitablePool = require("./profitablePool.json");

const chain = "arbitrum";

// type Options = {
//   pools: string[], // list of pool addresses
//   balances: Object, // balances object to accumulate protocol TVL
//   chainBlocks, // provided by DefiLlama SDK
// }

async function sumTvl(options) {
  const { pools } = options;
  for (const pool of pools) {
    await logPoolTvl(pool, options);
  }
}

async function logPoolTvl(target, options) {
  const { balances, chainBlocks } = options;

  const totalAssets = (
    await sdk.api.abi.call({
      chain,
      abi: abiProfitablePool.totalAssets,
      target,
      block: chainBlocks[chain],
    })
  ).output;

  const assetAddress = (
    await sdk.api.abi.call({
      chain,
      abi: abiProfitablePool.asset,
      target,
      block: chainBlocks[chain],
    })
  ).output;

  sdk.util.sumSingleBalance(balances, `${chain}:${assetAddress}`, totalAssets);
}

module.exports = {
  sumTvl,
};

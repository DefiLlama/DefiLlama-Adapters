const sdk = require("@defillama/sdk");
const abi = require("../origindollar/abi.json");

const vault = "0x39254033945aa2e4809cc2977e7087bee48bd7ab";

const ethTvl = async (timestamp, ethBlock) => {
  const balances = {};

  // Account WETH, rETH, frxETH and stETH backing up the minted OUSD
  const backingAssets = (
    await sdk.api.abi.call({
      abi: abi.getAllAssets,
      target: vault,
      block: ethBlock,
    })
  ).output;

  for (let i = 0; i < backingAssets.length; i++) {
    const backingAssetBalance = (
      await sdk.api.abi.call({
        abi: abi.checkBalance,
        target: vault,
        params: backingAssets[i],
        block: ethBlock,
      })
    ).output;

    sdk.util.sumSingleBalance(balances, backingAssets[i], backingAssetBalance);
  }

  return balances;
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
};

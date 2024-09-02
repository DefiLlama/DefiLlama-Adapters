const sdk = require("@defillama/sdk");
const abi = require("../origindollar/abi.json");

const vault = "0x98a0cbef61bd2d21435f433be4cd42b56b38cc93";

const baseTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};
  const block = chainBlocks["base"];
  const backingAssets = (
    await sdk.api.abi.call({
      chain: "base",
      abi: abi.getAllAssets,
      target: vault,
      block,
    })
  ).output;

  for (let i = 0; i < backingAssets.length; i++) {
    const backingAssetBalance = (
      await sdk.api.abi.call({
        chain: "base",
        abi: abi.checkBalance,
        target: vault,
        params: backingAssets[i],
        block,
      })
    ).output;

    sdk.util.sumSingleBalance(balances, backingAssets[i], backingAssetBalance, "base");
  }

  return balances;
};

module.exports = {
  base: {
    tvl: baseTvl,
  },
};

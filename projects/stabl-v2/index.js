const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const vault = "0x2D62f6D8288994c7900e9C359F8a72e84D17bfba";

const polygonTvl = async (timestamp, ethBlock, chainBlocks) => {
  const balances = {};

  const stablecoins = (
    await sdk.api.abi.call({
      abi: abi.getAllAssets,
      target: vault,
      block: chainBlocks['polygon'],
      chain: 'polygon'
    })
  ).output;

  for (let i = 0; i < stablecoins.length; i++) {
    const balance_stablecoin = (
      await sdk.api.abi.call({
        abi: abi.checkBalance,
        target: vault,
        params: stablecoins[i],
        block: chainBlocks['polygon'],
        chain: 'polygon'
      })
    ).output;

    sdk.util.sumSingleBalance(balances, stablecoins[i], balance_stablecoin,'polygon');
  }

  return balances;
};

module.exports = {
  polygon: {
    tvl: polygonTvl,
  },
};

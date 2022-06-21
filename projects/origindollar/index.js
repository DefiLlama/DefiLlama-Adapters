const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const vault = "0xE75D77B1865Ae93c7eaa3040B038D7aA7BC02F70";

const ethTvl = async (timestamp, ethBlock) => {
  const balances = {};

  // Account DAI, USDT and USDC backing up the minted OUSD
  const stablecoins = (
    await sdk.api.abi.call({
      abi: abi.getAllAssets,
      target: vault,
      block: ethBlock,
    })
  ).output;

  for (let i = 0; i < stablecoins.length; i++) {
    const balance_stablecoin = (
      await sdk.api.abi.call({
        abi: abi.checkBalance,
        target: vault,
        params: stablecoins[i],
        block: ethBlock,
      })
    ).output;

    sdk.util.sumSingleBalance(balances, stablecoins[i], balance_stablecoin);
  }

  return balances;
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
};

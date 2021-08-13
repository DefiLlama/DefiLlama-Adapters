const sdk = require("@defillama/sdk");
const erc20 = require("../helper/abis/erc20.json");
const abi = require("./abi.json");

const vault = "0xE75D77B1865Ae93c7eaa3040B038D7aA7BC02F70";

const strategies = [
  // Compound
  "0xD5433168Ed0B1F7714819646606DB509D9d8EC1f",
  // Aave
  "0x9f2b18751376cF6a3432eb158Ba5F9b1AbD2F7ce",
  // Curve 3Pool
  "0x3c5fe0a3922777343CBD67D3732FCdc9f2Fa6f2F",
];

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

  for (let i = 0; i < strategies.length; i++) {
    for (let j = 0; j < stablecoins.length; j++) {
      const supported = (
        await sdk.api.abi.call({
          abi: abi.supportsAsset,
          target: strategies[i],
          params: stablecoins[j],
          block: ethBlock,
        })
      ).output;

      if (supported) {
        const balance_stablecoin = (
          await sdk.api.abi.call({
            abi: abi.checkBalance,
            target: strategies[i],
            params: stablecoins[j],
            block: ethBlock,
          })
        ).output;

        sdk.util.sumSingleBalance(balances, stablecoins[j], balance_stablecoin);
      }
    }
  }

  // Idle stablecoins in vault
  for (let i = 0; i < stablecoins.length; i++) {
    const idle_balance = (
      await sdk.api.abi.call({
        abi: erc20.balanceOf,
        target: stablecoins[i],
        params: vault,
        block: ethBlock,
      })
    ).output;

    sdk.util.sumSingleBalance(balances, stablecoins[i], idle_balance);
  }

  return balances;
};

module.exports = {
  ethereum: {
    tvl: ethTvl,
  },
  tvl: sdk.util.sumChainTvls([ethTvl]),
};

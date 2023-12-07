const sdk = require("@defillama/sdk");
const BinaryVault = require("./BinaryVault.json");

const binaryVaultContract = "0x4d3847da139d423ae9569A9E6E4dd5b7405093FA";
const feeWallet = '0x04EC26b47E48F60740c803ba93b1a6C9e83cafAa'

async function arbitrumTVL(timestamp, block, chainBlocks) {
  let balances = {};

  const totalDepositedAmount = (
    await sdk.api.abi.call({
      chain: "arbitrum",
      block: chainBlocks.arbitrum,
      target: binaryVaultContract,
      abi: BinaryVault.totalDepositedAmount,
      params: [],
    })
  ).output;

  sdk.util.sumSingleBalance(
    balances,
    "arbitrum:0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    totalDepositedAmount
  );

  const feeAmount = (
    await sdk.api.erc20.balanceOf({
      chain: "arbitrum",
      block: chainBlocks.arbitrum,
      target: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      owner: feeWallet,
    })
  ).output;

  sdk.util.sumSingleBalance(
    balances,
    "arbitrum:0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    feeAmount
  );

  return balances;
}

module.exports = {
  arbitrum: {
    tvl: arbitrumTVL,
  },
};

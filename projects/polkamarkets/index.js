const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

const predictionMarketContractAddress =
  "0xdcbe79f74c98368141798ea0b7b979b9ba54b026";
const realtioContractAddress = "0x60d7956805ec5a698173def4d0e1ecdefb06cc57";
const polkMoonriverAddress = "0x8b29344f368b5fa35595325903fe0eaab70c8e1f";

async function tvl(timestamp, ethBlock, chainBlocks) {
  const balances = {};

  const movrBalance = (
    await sdk.api.eth.getBalance({
      target: predictionMarketContractAddress,
      block: chainBlocks.moonriver,
      chain: "moonriver",
    })
  ).output;

  const polkBalance = (
    await sdk.api.erc20.balanceOf({
      target: polkMoonriverAddress,
      owner: realtioContractAddress,
      chain: "moonriver",
      block: chainBlocks.moonriver,
    })
  ).output;

  sdk.util.sumSingleBalance(balances, "moonriver", Number(movrBalance) / 1e18);
  sdk.util.sumSingleBalance(
    balances,
    "polkamarkets",
    Number(polkBalance) / 1e18
  );

  return balances;
}

module.exports = {
  methodology:
    "Polkamarkets v1 TVL equals the contract (0xdcbe79f74c98368141798ea0b7b979b9ba54b026) Moonriver balance.",
  moonriver: {
    tvl,
  },
  tvl,
};

const sdk = require("@defillama/sdk");
const BigNumber = require("bignumber.js");

const contractAddress = "0xdcbe79f74c98368141798ea0b7b979b9ba54b026";

async function tvl(timestamp, ethBlock, chainBlocks) {
  const balance = (
    await sdk.api.eth.getBalance({
      target: contractAddress,
      block: chainBlocks.moonriver,
      chain: "moonriver",
    })
  ).output;

  return { moonriver: new BigNumber(balance).div(10 ** 18) };
}

module.exports = {
  methodology:
    "Polkamarkets v1 TVL equals the contract (0xdcbe79f74c98368141798ea0b7b979b9ba54b026) Moonriver balance.",
  moonriver: {
    tvl,
  },
  tvl,
};

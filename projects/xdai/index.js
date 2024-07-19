const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

const tokenAddresses = [
  ADDRESSES.ethereum.SAI,
  ADDRESSES.ethereum.DAI,
  //'0x06af07097c9eeb7fd685c692751d5C66db49c215'  // CHAI
  "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643", // cDAI
];
const owners = [
  "0x88ad09518695c6c3712AC10a214bE5109a655671",
  "0x7301CFA0e1756B71869E93d4e4Dca5c7d0eb0AA6",
  "0xf6A78083ca3e2a662D6dd1703c939c8aCE2e268d",
];
const xDaiBridge = "0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016";
const owlToken = "0x1a5f9352af8af974bfc03399e3767df6370d82e4";
const owlBridge = "0xed7e6720ac8525ac1aeee710f08789d02cd87ecb";
async function eth(api) {
  const ownerTokens = [
    [tokenAddresses, xDaiBridge],
    [[owlToken], owlBridge],
  ];
  return sumTokens2({ api, ownerTokens, owners, fetchCoValentTokens: true });
}

module.exports = {
  ethereum: {
    tvl: eth,
  },
  start: 1539028166,
};

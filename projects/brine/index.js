const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

const contracts = ["0x1390f521A79BaBE99b69B37154D63D431da27A07"];

const tokens = [
  ADDRESSES.null,
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.USDT,
  ADDRESSES.ethereum.WBTC,
  ADDRESSES.ethereum.MATIC,
  '0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1'
];

module.exports = {
  start: 1685817000,
  ethereum: { tvl: sumTokensExport({ owners: contracts, tokens, }) },
};

const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

const ethereumContracts = ["0x9a2d163ab40f88c625fd475e807bbc3556566f80"];

const ethereumTokens = [
  ADDRESSES.null,
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.USDT,
  ADDRESSES.ethereum.WBTC,
  ADDRESSES.ethereum.MATIC,
  '0xB50721BCf8d664c30412Cfbc6cf7a15145234ad1',
  ADDRESSES.ethereum.LINK,
  ADDRESSES.ethereum.AAVE,
  ADDRESSES.ethereum.MKR,

];

module.exports = {
  start: '2023-06-03',
  ethereum: { tvl: sumTokensExport({ owners: ethereumContracts, tokens: ethereumTokens, }) },
};
const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs");

const ethereumContracts = ["0x1390f521A79BaBE99b69B37154D63D431da27A07", "0xe17F8e501bF5e968e39D8702B30c3A8b955d8f52"];
const polygonContracts = ["0x2714C5958e2b1417B3f2b7609202FFAD359a5965"];

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
const polygonTokens = [
  ADDRESSES.polygon.USDC,
]

module.exports = {
  start: 1685817000,
  ethereum: { tvl: sumTokensExport({ owners: ethereumContracts, tokens: ethereumTokens, }) },
  polygon: { tvl: sumTokensExport({ owners: polygonContracts, tokens: polygonTokens}) },
};

const { sumTokensExport } = require("../helper/unwrapLPs");

const tokens = require("../helper/coreAssets.json");

const TOKENS = [
  tokens.null,
];

const ethereumContract = [
    "0x66be1bc6C6aF47900BBD4F3711801bE6C2c6CB32",
  ];

module.exports = {
  ethereum: { tvl: sumTokensExport({ owners: ethereumContract, tokens: TOKENS }) }
};

const sdk = require("@defillama/sdk");
const { sumTokensExport } = require("../helper/unwrapLPs");

const contract = "0x61F91266F6abEA61447E00EB781A3c38a3D1b925";
const KAVA = "0x0000000000000000000000000000000000000000";
const USDC = "0xfa9343c3897324496a05fc75abed6bac29f8a40f";

module.exports = {
  kava: { tvl: sumTokensExport({ owner: contract, tokens: [KAVA, USDC] }) },
};

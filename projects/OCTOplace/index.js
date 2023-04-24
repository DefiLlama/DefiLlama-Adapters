const sdk = require("@defillama/sdk");
const { sumTokensExport } = require("../helper/unwrapLPs");

const contractKAVA = "0x61F91266F6abEA61447E00EB781A3c38a3D1b925";
const contractTHETA = "0x6e4c614da85DD861e08f84706742239dBA892Df1";
const KAVA_TFUEL = "0x0000000000000000000000000000000000000000"; // Native coin
const USDC = "0xfa9343c3897324496a05fc75abed6bac29f8a40f";

module.exports = {
  kava: { tvl: sumTokensExport({ owner: contractKAVA, tokens: [KAVA_TFUEL, USDC] }) },
  theta: { tvl: sumTokensExport({ owner: contractTHETA, tokens: [KAVA_TFUEL] }) }
};

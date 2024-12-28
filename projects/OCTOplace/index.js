const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require("@defillama/sdk");
const { sumTokensExport } = require("../helper/unwrapLPs");

const contractKAVA = "0x61F91266F6abEA61447E00EB781A3c38a3D1b925";
const contractTHETA = "0x6e4c614da85DD861e08f84706742239dBA892Df1";
const KAVA_TFUEL = ADDRESSES.null; // Native coin
const USDC = ADDRESSES.telos.ETH;

module.exports = {
  kava: { tvl: sumTokensExport({ owner: contractKAVA, tokens: [KAVA_TFUEL, USDC] }) },
  theta: { tvl: sumTokensExport({ owner: contractTHETA, tokens: [KAVA_TFUEL] }) }
};

const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const BOC_TREASURY_ADDRESS = "0xBacF28BF21B374459C738289559EF89978D08102";
const CUSD_ADDRESS = "0x26043Aaa4D982BeEd7750e2D424547F5D76951d4";
const USDC_ADDRESS = ADDRESSES.cronos.USDC;

module.exports = {
  start: 6949784,
  cronos: {
    // tvl: sumTokensExport({ owner: BOC_TREASURY_ADDRESS, tokens: [CUSD_ADDRESS, USDC_ADDRESS]}),
    tvl: () => 0
  },
  methodology:
    "CDP collateral value + treasury mv",
};


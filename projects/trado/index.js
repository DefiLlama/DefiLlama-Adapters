const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");
// perp
const USDCe = '0x7f27352D5F83Db87a5A3E00f4B07Cc2138D8ee52'
const USDX = '0xAeBE92ebc1a67F810Cb35fdcdA6398f6136DCD50'

module.exports = {
  flow: { tvl: sumTokensExport({ owner: USDX, tokens: [USDCe], })},
  methodology: `The TVL for Trado Perpetual is calculated based on the value of all stablecoins locked in the USDX contract.`,
};

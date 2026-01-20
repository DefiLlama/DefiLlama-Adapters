const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");
// perp
const USDCe = ADDRESSES.milkomeda.BNB
const USDX = '0xAeBE92ebc1a67F810Cb35fdcdA6398f6136DCD50'

module.exports = {
  flow: { tvl: sumTokensExport({ owner: USDX, tokens: [USDCe], })},
  methodology: `The TVL for Trado Perpetual is calculated based on the value of all stablecoins locked in the USDX contract.`,
};

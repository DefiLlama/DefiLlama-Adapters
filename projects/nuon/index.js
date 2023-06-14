const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({ owner: '0x27788F93eEbB53728b887f13c16AdA286e1b6e92' ,tokens: [ADDRESSES.arbitrum.WETH, ADDRESSES.arbitrum.USDT]})
  }
}
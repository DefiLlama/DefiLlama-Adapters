const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  xdai: {
    tvl: sumTokensExport({ owner: ADDRESSES.xdai.SDAI, tokens: [ADDRESSES.xdai.WXDAI] })
  }
}
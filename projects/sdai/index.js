const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  xdai: {
    tvl: sumTokensExport({ owner: '0xaf204776c7245bF4147c2612BF6e5972Ee483701', tokens: [ADDRESSES.xdai.WXDAI] })
  }
}
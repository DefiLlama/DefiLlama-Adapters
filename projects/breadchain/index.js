const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  xdai: {
    tvl: sumTokensExport({ owner: '0xa555d5344f6fb6c65da19e403cb4c1ec4a1a5ee3', tokens: [ADDRESSES.xdai.DAI, ADDRESSES.xdai.SDAI]})
  },
}
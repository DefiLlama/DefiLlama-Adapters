const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  megaeth: {
    tvl: sumTokensExport({ owner: '0xb59126f8a13F907f63e67CFc248160698cE41918', token: ADDRESSES.megaeth.USDm }),
  },
}
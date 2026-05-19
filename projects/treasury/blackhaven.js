const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  megaeth: {
    tvl: sumTokensExport({ owner: '0xb59126f8a13F907f63e67CFc248160698cE41918', tokens: [ADDRESSES.megaeth.USDm, '0x5df82810cb4b8f3e0da3c031ccc9208ee9cf9500' ]}),
  },
}
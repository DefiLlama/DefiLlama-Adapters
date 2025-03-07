const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs');

module.exports = {
  flare: {
    tvl: sumTokensExport({
      owners: ['0xaA68BC4BAb9a63958466f49f5a58c54A412D4906'],
      tokens: [ADDRESSES.flare.WFLR, ]
    })
  },
}
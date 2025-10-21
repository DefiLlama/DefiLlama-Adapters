const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  occ: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [ADDRESSES.occ.WEDU, '0x07e4465c8f7A47a77761566A639C0a1CF26800dC'],
      ]
    })
  }
}
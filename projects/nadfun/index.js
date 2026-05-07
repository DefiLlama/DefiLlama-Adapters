const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
  methodology: 'Value of monad tokens in the bonding curve',
  monad: {
    tvl: sumTokensExport({ owner: '0xA7283d07812a02AFB7C09B60f8896bCEA3F90aCE', tokens: [ADDRESSES.monad.WMON]}),
  },
}
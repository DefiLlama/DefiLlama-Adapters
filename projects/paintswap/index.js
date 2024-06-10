const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking.js');

const factory = '0x733A9D1585f2d14c77b49d39BC7d7dd14CdA4aa5'
const masterchef = '0xCb80F529724B9620145230A0C866AC2FACBE4e3D'
const brush = '0x85dec8c4b2680793661bca91a8f129607571863d'

module.exports = {
  misrepresentedTokens: true,
      fantom:{
    tvl: getUniTVL({ factory, useDefaultCoreAssets: true }),
    staking: staking(masterchef, brush),
  }
}
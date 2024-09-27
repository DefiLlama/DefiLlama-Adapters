const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  shibarium: {
    tvl: getUniTVL({ factory: "0xc2b4218F137e3A5A9B98ab3AE804108F0D312CBC", useDefaultCoreAssets: true,})
  }
}

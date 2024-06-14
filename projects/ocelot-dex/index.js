const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  zeta: {
    tvl: getUniTVL({ factory: '0xA26E383c04013fB43F9E0b9F7903431d12FEa6d6', useDefaultCoreAssets: true, })
  }
}
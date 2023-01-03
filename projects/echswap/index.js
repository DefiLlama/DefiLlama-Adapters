const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  echelon: {
    tvl: getUniTVL({ chain: 'echelon', useDefaultCoreAssets: true, factory: '0xaFd37A86044528010d0E70cDc58d0A9B5Eb03206' })
  }
}
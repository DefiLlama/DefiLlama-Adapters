const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      factory: '0x7db16925214B2F5D65dB741D59208A1187B9961c',
      useDefaultCoreAssets: true
    })
  },
  polygon: {
    tvl: getUniTVL({
      factory: '0x177aeb3727c91c4796766336923c4da431c59637',
      useDefaultCoreAssets: true
    })
  },
  base: {
    tvl: getUniTVL({
      factory: '0x7db16925214B2F5D65dB741D59208A1187B9961c',
      useDefaultCoreAssets: true
    })
  }
}

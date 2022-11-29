const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  xdai: {
    tvl: getUniTVL({
      chain: 'xdai',
      factory: '0xa818b4f111ccac7aa31d0bcc0806d64f2e0737d7',
      useDefaultCoreAssets: true,
      blacklist: [
        '0x4f4f9b8d5b4d0dc10506e5551b0513b61fd59e75', 
      ],
      log_minTokenValue: 1e5,
      log_coreAssetPrices: [
        1/1e18,
        197/1e18,
        1824/1e18,
      ]
    })
  },
  polygon: {
    tvl: getUniTVL({
      chain: 'polygon',
      factory: '0x03daa61d8007443a6584e3d8f85105096543c19c',
      useDefaultCoreAssets: true,
      blacklist: ['0x8db0a6d1b06950b4e81c4f67d1289fc7b9359c7f']
    })
  },
}
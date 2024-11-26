const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  xdai: {
    tvl: getUniTVL({
      factory: '0xa818b4f111ccac7aa31d0bcc0806d64f2e0737d7',
      useDefaultCoreAssets: true,
      blacklist: [
        '0x4f4f9b8d5b4d0dc10506e5551b0513b61fd59e75', 
      ],
    })
  },
  polygon: {
    tvl: getUniTVL({
      factory: '0x03daa61d8007443a6584e3d8f85105096543c19c',
      useDefaultCoreAssets: true,
      blacklist: ['0x8db0a6d1b06950b4e81c4f67d1289fc7b9359c7f']
    })
  },
}
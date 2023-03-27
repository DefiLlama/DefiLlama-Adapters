const { getUniTVL, } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bitgert: {
    tvl: getUniTVL({
      factory: '0x9E6d21E759A7A288b80eef94E4737D313D31c13f',
      useDefaultCoreAssets: true,
    }),
  },
  xdc: {
    tvl: getUniTVL({
      factory: '0x9E6d21E759A7A288b80eef94E4737D313D31c13f',
      useDefaultCoreAssets: true,
    })
  },
  fuse: {
    tvl: getUniTVL({
      factory: '0x9E6d21E759A7A288b80eef94E4737D313D31c13f',
      useDefaultCoreAssets: true,
    })
  },
  dogechain: {
    tvl: getUniTVL({
      factory: '0x9E6d21E759A7A288b80eef94E4737D313D31c13f',
      useDefaultCoreAssets: true,
    })
  },
  core: {
    tvl: getUniTVL({
      factory: '0x9E6d21E759A7A288b80eef94E4737D313D31c13f',
      useDefaultCoreAssets: true,
    })
  },
};

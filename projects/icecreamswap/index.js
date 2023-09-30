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
  telos: {
    tvl: getUniTVL({
      factory: '0x9E6d21E759A7A288b80eef94E4737D313D31c13f',
      useDefaultCoreAssets: true,
    })
  },
  shimmer: {
    tvl: getUniTVL({
      factory: '0x24cb308a4e2F3a4352F513681Bd0c31a0bd3BA31',
      useDefaultCoreAssets: true,
    })
  },
  base: {
    tvl: getUniTVL({
      factory: '0x9e6d21e759a7a288b80eef94e4737d313d31c13f',
      useDefaultCoreAssets: true,
    })
  },
};

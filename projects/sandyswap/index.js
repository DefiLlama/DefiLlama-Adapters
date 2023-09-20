const { getUniTVL } = require('../helper/unknownTokens.js')

module.exports = {
  polygon_zkevm:{
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      hasStablePools: true,
      factory: '0xdb9908b6e0b87338194ae8627583194994bd992d',
    }),
  },
}

const { getUniTVL } = require('../helper/unknownTokens.js')

module.exports = {
  bsc:{
    tvl: getUniTVL({
      chain: 'bsc',
      useDefaultCoreAssets: true,
      factory: '0x0EFc2D2D054383462F2cD72eA2526Ef7687E1016',
    }),
  },
}

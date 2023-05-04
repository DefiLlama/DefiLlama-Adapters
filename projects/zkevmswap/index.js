const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  polygon_zkevm: {
    tvl: getUniTVL({
      chain: 'polygon_zkevm',
      factory: '0x213c25900f365F1BE338Df478CD82beF7Fd43F85',
      useDefaultCoreAssets: true,
    })
  },
}
const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  polygon_zkevm: {
    tvl: getUniTVL({
      chain: 'polygon_zkevm',
      factory: '0x49841094F19659e044671825d7ecb3B79368e6E5',
      useDefaultCoreAssets: true,
    })
  },
}

const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  iotaevm: {
    tvl: getUniTVL({
      factory: '0x10A288eF87586BE54ea690998cAC82F7Cc90BC50',
      useDefaultCoreAssets: true,
      hasStablePools: true,
    })
  },
}

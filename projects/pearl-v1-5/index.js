const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  'real': {
    tvl: getUniTVL({
      factory: '0xAed0A784f357BE9C3f8113BB227a7517a3444Efe', useDefaultCoreAssets: true, hasStablePools: true
    })
  }
};
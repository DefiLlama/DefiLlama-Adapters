const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0x553990F2CBA90272390f62C5BDb1681fFc899675',
    })
  }
};
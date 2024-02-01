const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  cronos: {
    tvl: getUniTVL({
      factory: '0x918cefF586C00c1fa4726Dc50697172fd87df8e9', 
      useDefaultCoreAssets: true
    })
  },
};
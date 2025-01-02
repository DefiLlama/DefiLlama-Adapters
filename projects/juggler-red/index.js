const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  optimism: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0x0bef94f16ce5b7c83b0bdbd9924cf80239ba9837',
    }),
  }
};
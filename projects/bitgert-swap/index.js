const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bitgert: {
    tvl: getUniTVL({
      factory: '0x456405E3d355ad27010Fd87e3c7cC8a2DcA372fD',
      useDefaultCoreAssets: true,
    }),
  },
};
const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bitgert: {
    tvl: getUniTVL({
      factory: '0x1379a7f0bfc346d48508B4b162c37a4c43dd89dc',
      useDefaultCoreAssets: true,
    }),
  },
};

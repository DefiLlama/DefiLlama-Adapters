const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      factory: '0x4a3b76860c1b76f0403025485de7bfa1f08c48fd',
      useDefaultCoreAssets: true,
    }),
  },
  polygon: {
    tvl: getUniTVL({
      factory: '0x17c1d25d5a2d833c266639de5fbe8896bdbeb234',
      useDefaultCoreAssets: true,
    }),
  },
  heco: {
    tvl: getUniTVL({
      factory: '0x4a3B76860C1b76f0403025485DE7bfa1F08C48fD',
      useDefaultCoreAssets: true,
    }),
  },
};
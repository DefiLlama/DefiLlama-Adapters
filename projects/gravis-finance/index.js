const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      chain: 'bsc',
      factory: '0x4a3b76860c1b76f0403025485de7bfa1f08c48fd',
      useDefaultCoreAssets: true,
    }),
  },
  polygon: {
  tvl: getUniTVL({
  chain: 'polygon',
  factory: '0x17c1d25d5a2d833c266639de5fbe8896bdbeb234',
  useDefaultCoreAssets: true,
  }),
  },
 // cronos: {
 //   tvl: getUniTVL({
 //     chain: 'cronos',
 //     factory: '0x5019EF5dd93A7528103BB759Bb2F784D065b826a',
 //     useDefaultCoreAssets: true,
 //   }),
 // },
};
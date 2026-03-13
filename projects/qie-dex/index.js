const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  qiev3: {
    tvl: getUniTVL({
      factory: '0x8E23128a5511223bE6c0d64106e2D4508C08398C',
      chain: 'qiev3',
      useDefaultCoreAssets: true,
    }),
  },
}
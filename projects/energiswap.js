const { getUniTVL } = require('./helper/unknownTokens')

module.exports = {
  energi: {
    tvl: getUniTVL({
      factory: '0x875aDBaF8109c9CC9AbCC708a42607F573f594E4',
      useDefaultCoreAssets: true,
    }),
  },
}

const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  hoo: {
    tvl: getUniTVL({
      chain: 'hoo',
      factory: '0x6168D508ad65D87f8F5916986B55d134Af7153bb',
      useDefaultCoreAssets: true,
    }),
  }
}

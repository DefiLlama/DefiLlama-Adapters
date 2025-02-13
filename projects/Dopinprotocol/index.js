const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    tara: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0x6074dfbdCCA72e8CD69C97eE81873Ea5cd6d4E0f',
    }),
  },
}
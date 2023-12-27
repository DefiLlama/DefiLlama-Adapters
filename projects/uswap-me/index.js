const { getUniTVL } = require('../helper/unknownTokens')

// https://uswap.me/analytics/
module.exports = {
  tron: {
    tvl: getUniTVL({
      factory: 'TQ4F8Gr1qRKcMva64qYweAJNAVtgfj6ZJd',
      useDefaultCoreAssets: true,
    }),
  },
}

const { getUniTVL } = require('../helper/unknownTokens.js')

module.exports = {
  misrepresentedTokens: true,
  base: {
    tvl: getUniTVL({ factory: '0x2D9A3a2bd6400eE28d770c7254cA840c82faf23f', hasStablePools: true, useDefaultCoreAssets: true,  }),
  },
}

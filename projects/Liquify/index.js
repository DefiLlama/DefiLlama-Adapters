const { getUniTVL } = require('../helper/unknownTokens.js')

module.exports = {
  misrepresentedTokens: true,
  core:{
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      hasStablePools: true,
      factory: '0x0Ed2a54c8fD6dcc3cF0f8fd97c748438f0f32eAD',
    }),
  },
}

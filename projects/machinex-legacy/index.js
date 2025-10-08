const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  peaq: {
    tvl: getUniTVL({
      factory: '0xA3f356f0403b4f10345cD95E0C80483FDdD63Ebd',
      useDefaultCoreAssets: true,
      hasStablePools: true
    }),
  },
}
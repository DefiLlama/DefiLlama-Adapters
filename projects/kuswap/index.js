const { getUniTVL } = require('../helper/unknownTokens');

module.exports = {
  misrepresentedTokens: true,
  kcc: {
    tvl: getUniTVL({
      factory: '0xAE46cBBCDFBa3bE0F02F463Ec5486eBB4e2e65Ae',
      useDefaultCoreAssets: true,
    }),
  },
}

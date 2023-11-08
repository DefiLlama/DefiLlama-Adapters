const { getUniTVL } = require('../helper/unknownTokens.js')

module.exports = {
  misrepresentedTokens: true,
  pulse:{
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      hasStablePools: true,
      factory: '0xEb60163cb688e4d605407025f761AA66B293d82D',
    }),
  },
}

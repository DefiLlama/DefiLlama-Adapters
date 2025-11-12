const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  sonic: {
    tvl: getUniTVL({
      factory: '0x2dA25E7446A70D7be65fd4c053948BEcAA6374c8',
      useDefaultCoreAssets: true,
      hasStablePools: true,
      blacklistedTokens: ['0xc31e2ac1a6fd9f80aaaa36a36530e035d2be8ac4']
    }),
  },
}
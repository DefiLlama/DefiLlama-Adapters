const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({
      factory: '0x2da10A1e27bF85cEdD8FFb1AbBe97e53391C0295',
      chain: 'era',
      useDefaultCoreAssets: true,
    })
  },
}; 
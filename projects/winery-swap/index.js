const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      factory: '0x79C342FddBBF376cA6B4EFAc7aaA457D6063F8Cb', 
      chain: 'bsc', 
      useDefaultCoreAssets: true
    })
  },
};
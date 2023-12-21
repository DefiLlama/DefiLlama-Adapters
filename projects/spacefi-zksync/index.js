const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: getUniTVL({
      factory: '0x0700Fb51560CfC8F896B2c812499D17c5B0bF6A7',
      useDefaultCoreAssets: true,
    })
  },
}; 

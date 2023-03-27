const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  evmos: {
    tvl: getUniTVL({
      factory: '0x868A71EbfC46B86a676768C7b7aD65055CC293eE',
      useDefaultCoreAssets: true,
    })
  },
  era: {
    tvl: getUniTVL({
      factory: '0x0700Fb51560CfC8F896B2c812499D17c5B0bF6A7',
      useDefaultCoreAssets: true,
    })
  },
}; 

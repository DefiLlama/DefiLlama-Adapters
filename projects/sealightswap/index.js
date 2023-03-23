const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  polygon: {
    tvl: getUniTVL({
      factory: '0xd0B30Fc63169bAaa3702ad7ec33EBe3f9e8627c0', 
      chain: 'polygon', 
      useDefaultCoreAssets: false
    })
  },
};
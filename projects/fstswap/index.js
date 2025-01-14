const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      factory: '0x9A272d734c5a0d7d84E0a892e891a553e8066dce', 
      useDefaultCoreAssets: true
    })
  },
};
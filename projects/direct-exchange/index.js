const { getUniTVL } = require('../helper/unknownTokens')
module.exports = {
  misrepresentedTokens: true,
  kava: {
    tvl: getUniTVL({ factory: '0xcE08c3d20Ff00a9Cf0D28922768bD606592B5D4C', useDefaultCoreAssets: true, })
  },
}

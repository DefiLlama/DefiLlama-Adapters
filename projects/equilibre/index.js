const { getUniTVL } = require('../helper/cache/uniswap.js')

module.exports = {
  misrepresentedTokens: true,
  kava: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0xA138FAFc30f6Ec6980aAd22656F2F11C38B56a95', fetchBalances: true, hasStablePools: true, })
  },
}

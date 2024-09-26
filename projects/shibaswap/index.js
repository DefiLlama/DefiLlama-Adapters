const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  shibarium: {
    tvl: getUniTVL({ factory: "0xEF83bbB63E8A7442E3a4a5d28d9bBf32D7c813c8", useDefaultCoreAssets: true,})
  },
  Ethereum: {
    tvl: getUniTVL({ factory: "0x115934131916c8b277dd010ee02de363c09d037c", useDefaultCoreAssets: true,})
  }
}

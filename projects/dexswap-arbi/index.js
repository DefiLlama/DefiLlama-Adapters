const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    tvl: getUniTVL({ factory: '0x3E40739d8478c58f9B973266974C58998D4F9e8b', useDefaultCoreAssets: true, }),
  }
}

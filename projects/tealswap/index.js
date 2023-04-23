const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  oas: {
    tvl: getUniTVL({ factory: '0x5200000000000000000000000000000000000018', useDefaultCoreAssets: true, })
  }
}
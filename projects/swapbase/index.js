const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  base: { tvl: getUniTVL({ factory: '0x04C9f118d21e8B767D2e50C946f0cC9F6C367300', useDefaultCoreAssets: true, }), },
}
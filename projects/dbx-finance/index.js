const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    tvl: getUniTVL({ factory: '0x41755a88d4ab443d5d8ef73ec64dd3df71fb5559', useDefaultCoreAssets: true, }),
  }
}

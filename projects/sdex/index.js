const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  arbitrum: {
    tvl: getUniTVL({ factory: '0x425D988a209125C58d16A9376f997D24009f569b', useDefaultCoreAssets: true, }),
  }
}

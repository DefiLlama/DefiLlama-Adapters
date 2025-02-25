const { getUniTVL } = require('../helper/unknownTokens.js')

module.exports = {
  misrepresentedTokens: true,
  base: {
    tvl: getUniTVL({
      factory: '0xcEFbebF0b85B1638C19b01cE2A02C262F421B07d',
      useDefaultCoreAssets: true,
      hasStablePools: true,
    })
  }
}
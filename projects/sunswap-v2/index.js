const { getUniTVL } = require('../helper/unknownTokens.js')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  tron: {
    tvl: getUniTVL({ factory: 'TKWJdrQkqHisa1X8HUdHEfREvTzw4pMAaY', useDefaultCoreAssets: true, }),
  }
}

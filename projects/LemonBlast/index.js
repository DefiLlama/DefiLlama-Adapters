const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  blast: { tvl: getUniTVL({ factory: '0x31329BcDC90faD4d65764ccf91f833ec1d5fB5A4', useDefaultCoreAssets: true,}), },
}

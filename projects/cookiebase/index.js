const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  base: { tvl: getUniTVL({ factory: '0x05b00D63DbC67874ad44d039213b7DAfB999d184', useDefaultCoreAssets: true, }), },
}
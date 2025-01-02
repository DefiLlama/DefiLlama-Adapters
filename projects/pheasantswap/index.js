const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  enuls: { tvl: getUniTVL({ factory: '0x7bf960B15Cbd9976042257Be3F6Bb2361E107384', useDefaultCoreAssets: true,}), },
}

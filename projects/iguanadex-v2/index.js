const { getUniTVL, } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  etherlink: { tvl: getUniTVL({ factory: '0x3eebf549D2d8839E387B63796327eE2C8f64A0C4', useDefaultCoreAssets: true }) }
};

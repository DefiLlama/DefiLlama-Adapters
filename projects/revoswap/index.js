const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  xlayer: {
    tvl: getUniTVL({ factory: '0xa38498983e7b31DE851e36090bc9D1D8fB96BE5E', useDefaultCoreAssets: true, }),
  }
}

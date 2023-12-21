const {getUniTVL} = require("../helper/unknownTokens");

module.exports = {
  op_bnb: {
    tvl: getUniTVL({ factory: "0x5640113EA7F369E6DAFbe54cBb1406E5BF153E90", useDefaultCoreAssets: true,})
  },
  shibarium: {
    tvl: getUniTVL({ factory: "0x5640113EA7F369E6DAFbe54cBb1406E5BF153E90", useDefaultCoreAssets: true,})
  },
  scroll: {
    tvl: getUniTVL({ factory: "0x5640113EA7F369E6DAFbe54cBb1406E5BF153E90", useDefaultCoreAssets: true,})
  }
};
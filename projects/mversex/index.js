const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,
  kava: {
    tvl: getUniTVL({ factory: "0x266F951c525130a4E230bB40F0e3525C6C99B9c5", useDefaultCoreAssets: true,  }),
  },
};

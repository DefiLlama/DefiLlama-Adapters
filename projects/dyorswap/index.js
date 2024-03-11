const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,
  mode: {
    tvl: getUniTVL({ factory: "0xE470699f6D0384E3eA68F1144E41d22C6c8fdEEf", useDefaultCoreAssets: true, }),
  },
  blast: {
    tvl: getUniTVL({ factory: "0xA1da7a7eB5A858da410dE8FBC5092c2079B58413", useDefaultCoreAssets: true, }),
  },
  merlin: {
    tvl: getUniTVL({ factory: "0xA1da7a7eB5A858da410dE8FBC5092c2079B58413", useDefaultCoreAssets: true, }),
  },
  zeta: {
    tvl: getUniTVL({ factory: "0xA1da7a7eB5A858da410dE8FBC5092c2079B58413", useDefaultCoreAssets: true, }),
  },
};

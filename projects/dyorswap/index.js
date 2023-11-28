const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,
  mode: {
    tvl: getUniTVL({ factory: "0xE470699f6D0384E3eA68F1144E41d22C6c8fdEEf", useDefaultCoreAssets: true, }),
  },
};

const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  xdc: {
    tvl: getUniTVL({ factory: "0xAf2977827a72e3CfE18104b0EDAF61Dd0689cd31", useDefaultCoreAssets: true, }),
  },
};
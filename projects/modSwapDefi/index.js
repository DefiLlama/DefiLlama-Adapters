const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,
  mode: {
    tvl: getUniTVL({ factory: "0x703ADd44002379AD963d6Cc506b8F2292C831644", useDefaultCoreAssets: true, }),
  },
};

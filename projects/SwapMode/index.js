const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,
  mode: {
    tvl: getUniTVL({ factory: "0xfb926356BAf861c93C3557D7327Dbe8734A71891", useDefaultCoreAssets: true, }),
  },
};

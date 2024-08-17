const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,
  blast: {
    tvl: getUniTVL({
      factory: "0xFfbDb302f29B29ee45D650DF44889450d252d868",
      useDefaultCoreAssets: true,
    }),
  },
};

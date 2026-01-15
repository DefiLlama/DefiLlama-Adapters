const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,

  blast: {
    tvl: getUniTVL({
      factory: "0xe9ecf70a6e8a00fafab980dc59ca7d3a4b800db9",
      useDefaultCoreAssets: true,
    }),
  },
};



const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,

  bsc: {
    tvl: getUniTVL({
      factory: "0xb6aC3914b53Cd3b39F11Fc9B380c3E605E994E20",
      useDefaultCoreAssets: true,
    }),
  },
};

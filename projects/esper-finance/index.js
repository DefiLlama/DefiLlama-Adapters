const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  mantle: {
    tvl: getUniTVL({ factory: '0x69C4515C926ac3db7A547044145495240961a7B5', useDefaultCoreAssets: true,  }),
  },
};

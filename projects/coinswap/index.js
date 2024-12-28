const { getUniTVL } = require("../helper/unknownTokens.js");

const factory = "0xC2D8d27F3196D9989aBf366230a47384010440c0";

module.exports = {
  misrepresentedTokens: true,
  methodology: 'TVL counts the liquidity of the DEX. The factory address(0xC2D8d27F3196D9989aBf366230a47384010440c0) is used to find every LP pair that has been created.',
  bsc: {
    tvl: getUniTVL({
      factory,
      useDefaultCoreAssets: true,
    }),
  },
};

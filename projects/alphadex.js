const { getUniTVL } = require("./helper/unknownTokens");
module.exports = {
  methodology: `Uses factory(0xdD9EFCbDf9f422e2fc159eFe77aDD3730d48056d) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
  misrepresentedTokens: true,
  moonriver: {
    tvl: getUniTVL({
      factory: "0xdD9EFCbDf9f422e2fc159eFe77aDD3730d48056d",
      useDefaultCoreAssets: true,
    }),
  },
  kava: {
    tvl: getUniTVL({
      factory: "0x7e666D934F7525dF840d0CfFEaa3d6Bf3b3253a3",
      useDefaultCoreAssets: true,
    }),
  },
};

const { getUniTVL } = require("./helper/unknownTokens");
module.exports = {
  methodology: `Uses factory(0x44B678F32a2f6aBB72eeFA2df58f12D17c3eD403) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
  misrepresentedTokens: true,
  arbitrum: {
    tvl: getUniTVL({
      factory: "0x44B678F32a2f6aBB72eeFA2df58f12D17c3eD403",
      useDefaultCoreAssets: true,
    }),
  },
};
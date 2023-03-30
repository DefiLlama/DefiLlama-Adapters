const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  methodology: `Uses factory(0x634e02EB048eb1B5bDDc0CFdC20D34503E9B362d) address and whitelisted tokens address to find and price liquidity pool pairs`,
  avax: {
    tvl: getUniTVL({
      factory: "0x634e02EB048eb1B5bDDc0CFdC20D34503E9B362d",
      fetchBalances: true,
      hasStablePools: true,
      useDefaultCoreAssets: true,
    }),
  },
};

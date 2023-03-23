const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  polygon: {
    tvl: getUniTVL({
      factory: "0x634e02EB048eb1B5bDDc0CFdC20D34503E9B362d",
      fetchBalances: true,
      useDefaultCoreAssets: true,
    }),
  },
};

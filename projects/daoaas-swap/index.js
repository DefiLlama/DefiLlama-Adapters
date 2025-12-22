const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  eni: {
    tvl: getUniTVL({
      methodology: "Pool liquidity of Dswap on DAOaas.",
      useDefaultCoreAssets: true,
      factory: "0x548C0E26CE90B333c07abb6d55546304D46d269d",
    }),
  },
};

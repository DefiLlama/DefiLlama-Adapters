const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  methodology: `Uses factory(0xEaD128BDF9Cff441eF401Ec8D18a96b4A2d25252) address and whitelisted tokens address to find and price liquidity pool pairs`,
  mantle: {
    tvl: getUniTVL({
      factory: "0xEaD128BDF9Cff441eF401Ec8D18a96b4A2d25252",
      hasStablePools: true,
      useDefaultCoreAssets: true,
    }),
  },
};

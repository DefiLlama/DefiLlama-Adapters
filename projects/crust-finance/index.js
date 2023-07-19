const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  methodology: `Uses factory(0xDE7eA96f6Ec6808A4aD03Dc939a44815e7323a43) address and whitelisted tokens address to find and price liquidity pool pairs`,
  mantle: {
    tvl: getUniTVL({
      factory: "0xDE7eA96f6Ec6808A4aD03Dc939a44815e7323a43",
      hasStablePools: true,
      useDefaultCoreAssets: true,
    }),
  },
};

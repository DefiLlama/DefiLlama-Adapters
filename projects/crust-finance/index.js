const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
  misrepresentedTokens: true,
  methodology: `Uses factory(0x62DbCa39067f99C9D788a253cB325c6BA50e51cE) address and whitelisted tokens address to find and price liquidity pool pairs`,
  mantle: {
    tvl: getUniTVL({
      factory: "0x62DbCa39067f99C9D788a253cB325c6BA50e51cE",
      hasStablePools: true,
      useDefaultCoreAssets: true,
    }),
  },
};

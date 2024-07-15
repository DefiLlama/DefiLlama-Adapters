const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,
  methodology:
    "We count liquidity of all paris through Factory Contract and Pools (single tokens) seccions through Factory Contract.",
  chz: {
    tvl: getUniTVL({
      factory: "0xE2918AA38088878546c1A18F2F9b1BC83297fdD3",
      useDefaultCoreAssets: true,
    }),
  },
};
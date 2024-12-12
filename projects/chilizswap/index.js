const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,
  methodology:
    "We count liquidity of all paris through Factory Contract and Pools (single tokens) seccions through Factory Contract.",
  chz: {
    tvl: getUniTVL({
      factory: "0xcF4A2be8Fe92fEe8e350AD8D876274749Ae0CBb1",
      useDefaultCoreAssets: true,
    }),
  },
};
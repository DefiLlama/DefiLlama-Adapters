const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  methodology:
    "Uses Uniswap-style factory address to find and price liquidity pairs.",
  base: {
    tvl: getUniTVL({
      factory: "0xe396465A85deDB00FA8774162B106833dE51Ea41",
    }),
  },
};

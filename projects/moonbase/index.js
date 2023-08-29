const { getUniTVL } = require("../helper/unknownTokens");
const MOON = "*";
module.exports = {
  methodology:
    "Uses Uniswap-style factory address to find and price liquidity pairs.",
  base: {
    tvl: getUniTVL({
      factory: "0xff0655dDdFE887e7bAECD7E731A755Bf9f386cEd",
    }),
  },
};

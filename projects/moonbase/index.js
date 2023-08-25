const { getUniTVL } = require("../helper/unknownTokens");
const MOON = "*";
module.exports = {
  methodology:
    "Uses Uniswap-style factory address to find and price liquidity pairs.",
  base: {
    tvl: getUniTVL({
      factory: "*",
    }),
  },
};

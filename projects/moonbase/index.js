const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  methodology:
    "Uses Uniswap-style factory address to find and price liquidity pairs.",
  base: {
    tvl: getUniTVL({
      factory: "0xA4CB5E815cC3919C279869Dda058D72976085fee",
    }),
  },
};


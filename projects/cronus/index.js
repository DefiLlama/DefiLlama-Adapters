const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x20570b7bFf86B2f92068622D0805160f318554Be) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  cronos: {
    tvl: calculateUsdUniTvl(
      "0x20570b7bFf86B2f92068622D0805160f318554Be",
      "evmos",
      "0xD4949664cD82660AaE99bEdc034a0deA8A0bd517",
      [
        
      ],
      "evmos"
    ),
  },
}; // node test.js projects/cronus/index.js
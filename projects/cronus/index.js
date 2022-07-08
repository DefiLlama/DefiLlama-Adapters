const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x20570b7bFf86B2f92068622D0805160f318554Be) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  evmos: {
    tvl: calculateUsdUniTvl(
      "0x20570b7bFf86B2f92068622D0805160f318554Be",
      "evmos",
      "0xD4949664cD82660AaE99bEdc034a0deA8A0bd517",
      [
        "0xe46910336479f254723710d57e7b683f3315b22b", //ceUSDC
        "0x51e44ffad5c2b122c8b635671fcc8139dc636e82", //USDC
        "0xe03494d0033687543a80c9b1ca7d6237f2ea8bd8", //FRAX        
      ],
      "evmos"
    ),
  },
}; // node test.js projects/cronus/index.js

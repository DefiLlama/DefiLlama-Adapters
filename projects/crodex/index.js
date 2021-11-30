const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0xe9c29cB475C0ADe80bE0319B74AD112F1e80058F) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  cronos: {
    tvl: calculateUsdUniTvl(
      "0xe9c29cB475C0ADe80bE0319B74AD112F1e80058F",
      "cronos",
      "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
      [
        "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59",
        "0x66e428c3f67a68878562e79A0234c1F83c208770",
        "0xe243CCab9E66E6cF1215376980811ddf1eb7F689",
      ],
      "crypto-com-chain"
    ),
  },
}; // node test.js projects/crodex/index.js

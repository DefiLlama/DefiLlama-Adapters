const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x0c6A0061F9D0afB30152b8761a273786e51bec6d) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  avax: {
    tvl: calculateUsdUniTvl(
      "0x0c6A0061F9D0afB30152b8761a273786e51bec6d",
      "avax",
      "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
      [
        "0xf9430aD8da4af7fb4091C57FE523af1236FF5b2C",
        "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
        "0xc7198437980c041c805A1EDcbA50c1Ce5db95118",
        "0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB",
        "0x264c1383EA520f73dd837F915ef3a732e204a493",
        "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7"
      ],
      "wrapped-avax"
    ),
  },
}; // node test.js projects/hunnyswap/index.js
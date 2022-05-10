const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x535646cf57E4155Df723bb24625f356d98ae9D2F) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  cronos: {
    tvl: calculateUsdUniTvl(
      "0x535646cf57E4155Df723bb24625f356d98ae9D2F",
      "fantom",
      "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83", //wftm
      [
        "0x04068da6c83afcfa0e13ba15a6696662335d5b75", //usdc
        "0x5602df4a94eb6c680190accfa2a475621e0ddbdc", //spa
        "0x049d68029688eabf473097a2fc38ef61633a3c7a", //fusdt
        "0x8d11ec38a3eb5e956b052f67da8bdc9bef8abf3e", //dai
      ],
      "wrapped-fantom"
    ),
  },
}; // node test.js projects/spartacus-exchange/index.js
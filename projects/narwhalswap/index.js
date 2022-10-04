const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: calculateUsdUniTvl(
      "0xB9fA84912FF2383a617d8b433E926Adf0Dd3FEa1",
      "bsc",
      "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
      ["0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c"],
      "WBNB"
    ),
  },
  methodology:
    "TVL accounts for the liquidity on all AMM pools, using the TVL chart on https://narwhalswap.org/#/dashboard as the source",
};

const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x794C07912474351b3134E6D6B3B7b3b4A07cbAAa) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  dfk: {
    tvl: calculateUsdUniTvl(
      "0x794C07912474351b3134E6D6B3B7b3b4A07cbAAa",
      "dfk",
      "0xCCb93dABD71c8Dad03Fc4CE5559dC3D89F67a260",
      [],
      "defi-kingdoms"
    ),
  },
};


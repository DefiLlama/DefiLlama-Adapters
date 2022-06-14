const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0xe8b97478ae8ab1fcfd46cdb2f62869ec63bbf69f) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  theta: {
    tvl: calculateUsdUniTvl(
      "0xe8b97478ae8ab1fcfd46cdb2f62869ec63bbf69f",
      "theta",
      "0x4dc08b15ea0e10b96c41aec22fab934ba15c983e",
      [],
      "theta-fuel"
    ),
  },
}

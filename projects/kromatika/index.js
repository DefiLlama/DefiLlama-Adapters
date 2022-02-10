const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Kromatika Factory address is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
  optimism: {
    tvl: calculateUsdUniTvl(
      "0x1f98431c8ad98523631ae4a59f267346ea31f984",
      "optimism",
      "0x4200000000000000000000000000000000000006",
      [],
      "ethereum"
    ),
    staking: () => ({})
  }
};
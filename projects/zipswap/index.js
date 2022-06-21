const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  misrepresentedTokens: true,
  optimism: {
    tvl: calculateUsdUniTvl(
      "0x8BCeDD62DD46F1A76F8A1633d4f5B76e0CDa521E",
      "optimism",
      "0x4200000000000000000000000000000000000006",
      [],
      "weth"
    ),
  },
  arbitrum: {
    tvl: calculateUsdUniTvl(
      "0x9e343Bea27a12B23523ad88333a1B0f68cc1F05E",
      "arbitrum",
      "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
      [],
      "weth"
    ),
  },
  methodology:
    "Factory addresses on Optimism and Arbitrum are used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
};

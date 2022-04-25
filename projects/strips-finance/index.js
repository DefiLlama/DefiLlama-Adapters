const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')

module.exports = {
    misrepresentedTokens: true,
    arbitrum: {
      tvl: calculateUsdUniTvl(
        "0xc35dadb65012ec5796536bd9864ed8773abc74c4",
        "arbitrum",
        "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
        [],
        "weth"
      ),
    },
    methodology:
      "Factory addresses on  Arbitrum are used to find the LP pairs. TVL is equal to liquidity in AMM together with the sum of Liquidity in insurence and Fundings Markets",
  };
  
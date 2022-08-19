const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");
const { staking } = require('../helper/staking')

const xDOGMONEY = "0xC5c70fA7A518bE9229eB0Dc84e70a91683694562";
const DOGMONEY = "0x93C8a00416dD8AB9701fa15CA120160172039851";
const USDC = "0x765277EebeCA2e31912C9946eAe1021199B39C61";
const WWDOGE = "0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101";
const FACTORY = "0xaF85e6eD0Da6f7F5F86F2f5A7d595B1b0F35706C";

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0xaF85e6eD0Da6f7F5F86F2f5A7d595B1b0F35706C) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    dogechain: {
    tvl: calculateUsdUniTvl(
      FACTORY,
      "dogechain",
      WWDOGE,
      [DOGMONEY, USDC],
      "dogecoin"
    ),
    staking: staking(xDOGMONEY, DOGMONEY, 'dogechain', 'dogecoin', 18)
  },
};

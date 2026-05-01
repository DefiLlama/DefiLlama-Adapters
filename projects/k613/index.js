const { aaveV3Export } = require("../helper/aave");

// K613 — Aave v3 fork lending market on Monad
// POOL_ADDRESSES_PROVIDER: 0x1f6E754C6F7A49e2d69e5341d65EcB8f8506C69c
// ProtocolDataProvider:    0xfc87bE7f3657AAD69baDb6247A88E924D1F8bc53
module.exports = {
  methodology:
    "K613 is an Aave v3-based lending market on Monad. TVL counts tokens " +
    "supplied to all reserves via aTokens; borrowed counts variable + stable debt.",
  ...aaveV3Export({
    monad: ["0xfc87bE7f3657AAD69baDb6247A88E924D1F8bc53"],
  }),
};

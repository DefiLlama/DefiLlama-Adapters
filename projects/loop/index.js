const { get } = require("../helper/http");
const { toUSDTBalances } = require("../helper/balances");

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  juno: {
    tvl: async () =>
      toUSDTBalances(
        Object.values(
          await get("https://middlewareapi.loop.markets/v1/juno/pool/current"),
        )
          .map(m => m.token_liquidity_usd)
          .reduce((p, c) => Number(p) + Number(c), 0),
      ),
  },
};

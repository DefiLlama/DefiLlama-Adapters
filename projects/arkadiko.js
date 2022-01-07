const retry = require("./helper/retry");
const axios = require("axios");

async function tvl() {
  let balances = {};
  const dikoPrice = (
    await retry(
      async (bail) =>
        await axios.get("https://arkadiko-api.herokuapp.com/api/v1/tokens/diko")
    )
  ).data["price_in_cents"];

  const response = (
    await retry(
      async (bail) =>
        await axios.get("https://arkadiko-api.herokuapp.com/api/v1/pools")
    )
  ).data;

  for (pool of response.pools) {
    balances[pool.token_y_name] =
      pool.token_y_name in balances
        ? Number(balances[pool.token_y_name]) + Number(pool.tvl_token_y)
        : Number(pool.tvl_token_y);
    balances[pool.token_x_name] =
      pool.token_x_name in balances
        ? Number(balances[pool.token_x_name]) + Number(pool.tvl_token_x)
        : Number(pool.tvl_token_x);
  }

  balances["blockstack"] = balances["wrapped-stx-token"] / 10 ** 6;
  delete balances["wrapped-stx-token"];
  balances["usd-coin"] = balances["usda-token"] / 10 ** 6;
  delete balances["usda-token"];
  balances["usd-coin"] =
    Number(balances["usd-coin"]) +
    Number(balances["arkadiko-token"] / 10 ** 8) * dikoPrice;
  delete balances["arkadiko-token"];

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  stacks: {
    tvl,
  },
};
// node test.js projects/arkadiko.js

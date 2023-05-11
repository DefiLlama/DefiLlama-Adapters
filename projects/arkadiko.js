const { get } = require('./helper/http')
// node test.js projects/arkadiko.js
async function tvl() {
  let balances = {};
  const dikoPrice = (await get("https://arkadiko-api.herokuapp.com/api/v1/tokens/diko"))["price_in_cents"];
  const response = (await get("https://arkadiko-api.herokuapp.com/api/v1/pools"));

  for (let pool of response.pools) {
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
  balances["wrapped-bitcoin"] = balances["Wrapped-Bitcoin"] / 10 ** 8;
  delete balances["Wrapped-Bitcoin"]

  return balances;
}

module.exports = {
  misrepresentedTokens: true,
  stacks: {
    tvl,
  },
};
// node test.js projects/arkadiko.js

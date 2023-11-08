const { get } = require("../helper/http");
const { toUSDTBalances } = require("../helper/balances");

const endpoint =
  "https://waves.exchange/api/v1/investments/tvl";

function tvl(isStaking) {
  let key = isStaking ? "wx_staking" : "liquidity_pools"
  return async () => {
    return toUSDTBalances(
      (await get(endpoint)).products
        .filter(p => p.product_id === key)
        .map(p => p.tvl)
        .reduce((p, c) => Number(p) + Number(c), 0),
    );
  }
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  waves: {
    tvl: tvl(false),
    staking: tvl(true),
  },
};

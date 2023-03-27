const { get } = require("../helper/http");
const { toUSDTBalances } = require("../helper/balances");

const endpoint =
  "https://mainnet-dev.wvservices.exchange/api/v1/investments/tvl";

function tvl(isStaking) {
  return async () =>
    toUSDTBalances(
      (await get(endpoint)).products
        .filter(p => p.product_id == "wx_staking" == isStaking)
        .map(p => p.tvl)
        .reduce((p, c) => Number(p) + Number(c), 0),
    );
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  waves: {
    tvl: tvl(false),
    staking: tvl(true),
  },
};

const { toUSDTBalances } = require("../helper/balances");
const { get } = require("../helper/http");

async function tvl() {
  const { tvl } = await get("https://lending-relay-fee.omnibtc.finance/tvl");

  return toUSDTBalances(tvl);
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};

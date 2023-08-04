const { toUSDTBalances } = require("../helper/balances");
const { get } = require("../helper/http");

const API_URL = "https://pulsar-money-prod.herokuapp.com/metrics/tvl";

async function tvl() {
  const data = await get(API_URL);

  return toUSDTBalances(data);
}

module.exports = {
  timetravel: false,
  elrond: {
    tvl: tvl,
  },
};

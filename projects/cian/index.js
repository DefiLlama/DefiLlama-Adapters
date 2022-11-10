const retry = require("../helper/retry");
const axios = require("axios");
const { toUSDTBalances } = require("../helper/balances");

async function fetchAvax() {
  const value = (
    await retry(async (cian) => await axios.get("https://data.cian.app/tvl "))
  ).data;

  return toUSDTBalances(value);
}

async function fetchPolygon() {
  const value = (
    await retry(
      async (cian) =>
        await axios.get("https://data.cian.app/polygon/api/v1/tvl")
    )
  ).data;

  return toUSDTBalances(value);
}

module.exports = {
  misrepresentedTokens: true,
  doublecounted: true,
  timetravel: false,
  avax: {
    tvl: fetchAvax,
  },
  polygon: {
    tvl: fetchPolygon,
  },
};

const { get } = require('../helper/http')
const { toUSDTBalances } = require("../helper/balances");

async function fetchAvax() {
  const value = (
    await get("https://data.cian.app/tvl ")
  );

  return toUSDTBalances(value);
}

async function fetchPolygon() {
  const value = (
    await get("https://data.cian.app/polygon/api/v1/tvl")
    )

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

const { get } = require("../helper/http");

const API_URL =
  "https://ponzi-backend-production.up.railway.app/api/analytics/tvl";
async function tvl() {
  //fetch the sum of all ETH balances of all game contracts
  const data = await get(API_URL);
  return {
    "0x0000000000000000000000000000000000000000": data?.tvl * 1e18,
  };
}

module.exports = {
  timetravel: false,
  methodology:
    "Ponzi Market's TVL equals to the sum of all ETH balances of all game contracts",
  arbitrum: {
    tvl,
  },
};

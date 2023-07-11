const { toUSDTBalances } = require("../helper/balances");
const { get } = require("../helper/http");

const API_URL = "https://api-nfts.jewelswap.io/tvl";

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

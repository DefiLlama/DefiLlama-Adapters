const axios = require("axios");
const { toUSDTBalances } = require("../helper/balances");
const sdk = require("@defillama/sdk");

async function tvls() {
  const res = await axios.get("https://api.agilefi.org/api/v1/cmc/tvl");
  data = res.data.data;
  return toUSDTBalances(data.tvl);
}

module.exports = {
  misrepresentedTokens: true,
  tvl: tvls,
};
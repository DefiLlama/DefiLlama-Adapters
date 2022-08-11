/**
 * Streamflow token distribution platform: https://streamflow.finance/.
 * Endpoint for fetching TVL is open sourced at: https://github.com/streamflow-finance/analytics/
 * 1. It uses CoinGecko to fetch token prices
 * 2. Fetches data from Solana for 2 streamflow programs
 * 3. The server multiplies the token price by the amount of tokens in the program and sums them up
 */

const axios = require("axios");
const retry = require('../helper/retry');

const url = "https://maximus.internal-streamflow.com/api/contracts/summary";

async function fetch() {
  var response = await retry(async () => await axios.get(url))

  return response.data.total_value_locked;
}

module.exports = {
  fetch,
};

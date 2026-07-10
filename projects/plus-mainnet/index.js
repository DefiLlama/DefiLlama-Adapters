const axios = require("axios");
const { toUSDTBalances } = require('../helper/balances');
async function fetch() {
  const response = await axios.get("https://plusmain.net/api/defillama/tvl", { timeout: 10000 });
  return toUSDTBalances(response.data.tvl);
}
module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "TVL is calculated based on Genesis Node Staking, Ecosystem Treasury, and Live User Deposits tracked via the official PLUS Mainnet metrics API.",
  bsc: {
    tvl: fetch
  }
}

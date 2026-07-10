const axios = require("axios");
async function fetch() {
  const response = await axios.get("https://plusmain.net/api/defillama/tvl");
  return response.data.tvl;
}
module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "TVL is calculated based on Genesis Node Staking, Ecosystem Treasury, and Live User Deposits tracked via the official PLUS Mainnet metrics API.",
  bsc: {
    tvl: fetch
  }
}

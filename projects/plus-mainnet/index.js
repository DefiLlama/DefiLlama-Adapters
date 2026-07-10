const axios = require("axios");
const { toUSDTBalances } = require('../helper/balances');
async function fetch() {
  const response = await axios.get("https://plusmain.net/api/defillama/tvl");
  // 단순 숫자가 아닌 USDT(달러) 단위임을 명시하여 리턴합니다.
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

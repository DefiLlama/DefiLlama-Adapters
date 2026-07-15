const { fetchURL } = require("../helper/utils");

async function fetch() {
  const response = await fetchURL("https://bot.plusmain.net/api/defillama/tvl");
  return response.data.tvl;
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "TVL includes Base Genesis Node Staking, Ecosystem Treasury Liquidity, and Live User Deposits tracked via the official PLUS Hybrid DEX API.",
  tvl: fetch
};

const { fetchURL } = require("../helper/utils");

async function fetch() {
  const response = await fetchURL("https://bot.plusmain.net/api/defillama/tvl");
  return response.data.tvl;
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "TVL includes Base Genesis Node Staking, Ecosystem Treasury Live User Deposits managed off-chain.",
  plus: {
    tvl: fetch
  }
};

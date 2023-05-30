const { fetchURL } = require("../helper/utils")

async function fetch() {
  const res = await fetchURL("https://api.saucerswap.finance/stats/tvl");
  return res.data.tvl;
}

module.exports = {
  timetravel: false,
  methodology: 'The calculated TVL is the current USD sum of all pools found under https://analytics.saucerswap.finance',
  fetch
}
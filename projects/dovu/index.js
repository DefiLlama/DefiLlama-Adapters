const { fetchURL } = require("../helper/utils")

async function fetch() {
  const res = await fetchURL("https://api.dovu.market/api/v1/staking-info");
  return res.data.total_value_locked.usd;
}

module.exports = {
  timetravel: false,
  methodology: 'The calculated TVL is the current USD sum of all accounts staked in the DOVU staking pool.',
  fetch
}
const utils = require('../helper/utils');
const endpoint = "https://api.hydradx.io/defillama/v1/tvl/";

async function fetch() {
  const response = await utils.fetchURL(endpoint);
  const tvl = response.data[0].tvl_usd;
  return tvl;
}

module.exports = {
  timetravel: false,
  fetch,
  methodology: `Tracks Total TVL in HydraDX Omnipool`
}
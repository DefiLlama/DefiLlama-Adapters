const axios = require('axios');
const retry = require('../helper/retry')

async function fetch() {
  const totalSupplyResponse = await retry(async bail => await axios.get("https://api.paintswap.finance/tvl"));
  return totalSupplyResponse.data.tvl_usd;
}

module.exports = {
  fetch
}
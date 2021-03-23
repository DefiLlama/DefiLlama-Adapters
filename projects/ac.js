const retry = require('async-retry')
const axios = require("axios");

async function fetch() {
  let response = await retry(async bail => await axios.get('https://api.coingecko.com/api/v3/coins/acoconut'));
  return (response.data.market_data.current_price.usd * response.data.market_data.total_supply);
}


module.exports = {
  fetch
}

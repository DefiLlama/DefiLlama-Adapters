const retry = require('async-retry')
const axios = require("axios");

async function fetch() {
  var response = await retry(async bail => await axios.get('https://api.raydium.io/tvl'))

  return response.data || 0;
}

module.exports = {
  fetch
}

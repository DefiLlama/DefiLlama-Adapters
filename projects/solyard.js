const retry = require('./helper/retry')
const axios = require("axios");

async function fetch() {
  var response = await retry(async bail => await axios.get('https://solyard.finance/tvl'))

  return response.total || {};
}

module.exports = {
  fetch
}

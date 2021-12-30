const retry = require('async-retry')
const axios = require("axios");

async function fetch() {
  var stats = await retry(async bail => await axios.get('https://query.niifi.com/api/v1/tokens/general-stats'))
  tvl = stats.data.data.tvl;
  return tvl;
}

module.exports = {
  fetch
}

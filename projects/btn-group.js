const retry = require('./helper/retry')
const axios = require("axios");

async function fetch() {
  var response = await retry(async bail => await axios.get('https://btn.group/pools/tvl'))

  return response.data;
}

module.exports = {
  fetch
}
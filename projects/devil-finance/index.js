const retry = require('../helper/retry');
const axios = require("axios");

async function fetch() {
  var response = await retry(async _ => await axios.get('https://devilfinance.io/api/tvls'));

  return response.data;
}

module.exports = {
  fetch
}
const retry = require('async-retry')
const axios = require("axios");

async function fetch() {
  const tvl = await retry(async bail => await axios.get('https://data.tenset.io/api/?action=getTvl'));
  return tvl.data;
}

module.exports = {
  fetch
}

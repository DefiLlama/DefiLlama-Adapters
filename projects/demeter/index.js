const retry = require('async-retry')
const axios = require("axios");

async function fetch() {
  let results = await retry(async bail => await axios.get('https://farming-api.cerestoken.io/get-supply-data'));
  return results.data.tvl;
}

module.exports = {
  fetch
}
const retry = require('async-retry')
const axios = require("axios");

async function fetch() {
  let tvl = await retry(async bail => await axios.get());
  return tvl;
}

module.exports = {
  fetch
}

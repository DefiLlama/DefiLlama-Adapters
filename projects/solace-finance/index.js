const retry = require("async-retry")
const axios = require("axios");

async function fetch() {
  // github repository https://github.com/solace-fi/solace-stats
  var res = await retry(async bail => await axios.get('https://stats.solace.fi/tvl'));
  var tvl = parseFloat(res["data"]["tvl_usd"]);
  return tvl;
}

module.exports = {
  fetch
}

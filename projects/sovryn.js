const retry = require('async-retry')
const axios = require("axios");
async function fetch() {
  let tvl_feed = await retry(async bail => await axios.get('https://backend.sovryn.app/tvl'))
  let tvl = tvl_feed.data.tvlLending.totalUsd + tvl_feed.data.tvlAmm.totalUsd + tvl_feed.data.tvlProtocol.totalUsd;
  return tvl;
}
fetch().then(console.log)
module.exports = {
  fetch
}

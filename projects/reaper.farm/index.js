const retry = require('async-retry')
const axios = require("axios");
const REAPER_API = "https://www.reaper.farm/api";

async function fetch() {
  const tvlMsg = await retry(async bail => await axios.get(REAPER_API+"/tvlTotal"));
  const tvl = tvlMsg.data.data.tvlTotal;
  return tvl;
}

module.exports = {
  fetch
}

const axios = require("axios");
const REAPER_API = "http://api.reaper.farm/api/";

const client = axios.create({
  baseURL: REAPER_API
});

async function fetch() {
  const tvlMsg = await client.get("/tvlTotal");
  const tvl = tvlMsg.data.data.tvlTotal;
  return tvl;
}

module.exports = {
  methodology: `TVL is fetched from the Reaper API(http://api.reaper.farm/api)`,
  fetch
}

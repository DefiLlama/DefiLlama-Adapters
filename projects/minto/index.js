const axios = require("axios");
const MINTO_API_TVL = "https://stats-dev.minto.org/v1";


const client = axios.create({
  baseURL: MINTO_API_TVL
});



async function fetch() {
  const tvlRes = await client.get("general/tapp-tvl");
  const tvl = tvlRes.data.value;
  return tvl;
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  misrepresentedTokens: true,
  methodology: "Return TVL from minto api",
  fetch
}
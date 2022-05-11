const axios = require("axios");
const STARSTREAM_API = "https://starstream.finance/api/";

const client = axios.create({
  baseURL: STARSTREAM_API
});

async function fetch() {
  const tvlMsg = await client.get("/tvl");
  return tvlMsg.data.tvlTotal;
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  misrepresentedTokens: true,
  metis: {
    fetch
  },
  fetch
}

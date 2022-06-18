const axios = require("axios");
const STARSTREAM_API = "https://starstream.finance/api/";

const client = axios.create({
  baseURL: STARSTREAM_API
});

let _tvlMsg

async function fetch() {
  if (!_tvlMsg) _tvlMsg = client.get("/tvl")
  const { data: { tvlTotal } } = await _tvlMsg
  return tvlTotal;
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  misrepresentedTokens: true,
  metis: {
    fetch
  },
  fetch,
}

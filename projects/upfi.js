const { getTokenAccountBalance } = require("./helper/solana");
const axios = require("axios");
const retry = require("./helper/retry");

async function fetch() {
  const response = (
    await retry(async (bail) => await axios.get("https://api.upfi.network/tvl"))
  ).data;
  return response.tvl || 0;
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL data is pulled from the UPFI API "https://api.upfi.network/tvl".',
  fetch,
};

const retry = require("../helper/retry");
const axios = require("axios");

async function fetch() {
  const response = (
    await retry(
      async (bail) => await axios.post("https://dexapi.globiance.com/get-stats")
    )
  ).data;

  const tvl = response.data.tvl;

  return tvl;
}

module.exports = {
  fetch,
};

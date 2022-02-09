const retry = require("./helper/retry");
const axios = require("axios");

async function fetch() {
  const response = (
    await retry(
      async (bail) =>
        await axios.get("https://stat.sentre.io/public/api/v1/tvl")
    )
  ).data;
  const tvl = response.tvl;
  return tvl;
}

module.exports = {
  timetravel: false,
  fetch,
};

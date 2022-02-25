const retry = require("./helper/retry");
const axios = require("axios");

async function fetch() {
  const response = (
    await retry(
      async () => await axios.get("https://api.crema.finance/tvl/24hour")
    )
  ).data;

  const tvl = response.data.total_tvl_in_usd;
  return tvl;
}

module.exports = {
  timetravel: false,
  fetch,
};

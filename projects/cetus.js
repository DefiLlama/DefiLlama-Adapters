const retry = require("./helper/retry");
const axios = require("axios");

async function fetch() {
  const response = (
    await retry(
      async () => await axios.get("https://api.cetus.zone/v2/swap/count")
    )
  ).data;
  const tvl = response.data.tvl_in_usd_sum_v1;
  return tvl;
}

module.exports = {
  timetravel: false,
  fetch,
};
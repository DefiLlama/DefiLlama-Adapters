const retry = require("./helper/retry");
const axios = require("axios");

async function fetch() {
  const response = (
    await retry(
      async () =>
        await axios.get(
          "https://asia-south1-cyclos-finance.cloudfunctions.net/stats"
        )
    )
  ).data;

  const tvl = response.data.TVL;
  return tvl;
}

module.exports = {
  timetravel: false,
  fetch,
};

const retry = require("../helper/retry");
const axios = require("axios");

async function fetch() {
  return (
    await retry(
      async () =>
        await axios.get(
          "https://asia-south1-cyclos-finance.cloudfunctions.net/stats"
        )
    )
  ).data.TVL;
};

module.exports = {
  timetravel: false,
  fetch,
};

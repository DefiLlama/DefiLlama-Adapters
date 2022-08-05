const retry = require("../helper/retry");
const axios = require("axios");

async function fetch() {
  return (
    await retry(
      async () =>
        await axios.get(
          "https://analytics.cykura.io/api/protocolData"
        )
    )
  ).data.tvlUSD;
};

module.exports = {
  timetravel: false,
  fetch,
};

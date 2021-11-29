const axios = require("axios");
const retry = require("../helper/retry");

const tvlApi = "https://app.rivrkitty.com/api/tvl/1285";

async function fetch() {
  const result = await retry(async (bail) => await axios.get(tvlApi));
  return parseInt(result.data.total);
}

module.exports = {
  moonriver: {
    fetch,
  },
  fetch,
};

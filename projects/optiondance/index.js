const retry = require("async-retry");
const axios = require("axios");

const APIs = {
  optiondance: "https://api.option.dance/api/v1/statistics/tvl",
};

async function fetch() {
  const resp = await retry(async (bail) => await axios.get(APIs.optiondance));
  const tvl = resp.data.data.total_value;
  return parseFloat(tvl).toFixed(2);
}

module.exports = {
  fetch,
};
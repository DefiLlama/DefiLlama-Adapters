const retry = require("./helper/retry");
const axios = require("axios");

async function fetch() {
  const response = (
    await retry(async (bail) => await axios.get("https://api.cropper.finance/cmc/pools"))
  ).data;

  const liqArrPerPool = response.map((pool) => pool.tvl);

  return liqArrPerPool.reduce((a, b) => a + b, 0);
}

module.exports = {
  timetravel: false,
  fetch,
};
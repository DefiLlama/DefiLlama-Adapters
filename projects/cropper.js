const retry = require("./helper/retry");
const axios = require("axios");

async function fetch() {
  const response = (
    await retry(async (bail) => await axios.get("https://api.cropper.finance/cmc/pools"))
  ).data;

  const liqArrPerPool = Object.values(response).map((pool) => pool.tvl);

  return liqArrPerPool.reduce((a, b) => a + b, 0);
}

async function fetchStaking() {
  const response = (
    await retry(async (bail) => await axios.get("https://api.cropper.finance/staking/"))
  ).data;

  return response.value;
}

module.exports = {
  timetravel: false,
  fetch,
  staking: {
    fetch: fetchStaking
  }
}; // node test.js projects/cropper.js
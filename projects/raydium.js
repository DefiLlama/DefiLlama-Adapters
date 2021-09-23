const retry = require("./helper/retry");
const axios = require("axios");

async function fetch() {
  const response = (
    await retry(async (bail) => await axios.get("https://api.raydium.io/pairs"))
  ).data;

  const liqArrPerPool = response.map((pool) => pool.liquidity);

  const tvl = liqArrPerPool.reduce((a, b) => a + b, 0);

  return tvl || 0;
}

module.exports = {
  fetch,
};

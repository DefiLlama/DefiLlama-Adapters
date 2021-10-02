const retry = require("./helper/retry");
const axios = require("axios");

async function fetch() {
  const response = (
    await retry(async (bail) => await axios.get("https://francium.io/api/pools/liquidity"))
  ).data.data;

  const poolLiqArray = response.farm.map(pool => pool.liquidityLocked);
  const lendArray = response.lend.map(pool => pool.available);
  const tvl = [...poolLiqArray, ...lendArray, response.old].reduce((a, b) => a + b, 0);

  return tvl;
}

module.exports = {
  fetch,
};

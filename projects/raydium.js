const { get } = require('./helper/http')
async function fetch() {
  const response = (
    await get("https://api.raydium.io/pairs"))

  const liqArrPerPool = response.map((pool) => pool.liquidity);

  return liqArrPerPool.reduce((a, b) => a + b, 0);
}

module.exports = {
  hallmarks:[
    [1667865600, "FTX collapse"]
],
  timetravel: false,
  fetch,
};

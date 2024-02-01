const { get } = require('../helper/http');

async function fetch() {
  var totalTvl = await get('https://amm-api.stellarx.com/api/pools/?cursor=1&format=json&limit=500&order=desc&orderField=liquidity');
  return totalTvl.pools.reduce((a, i) => a + i.liquidity, 0)
}

module.exports = {
  fetch,
}

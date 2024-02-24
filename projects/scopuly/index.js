const { get } = require('../helper/http');

async function tvl() {
  var totalTvl = await get('https://api.scopuly.com/api/liquidity_pools_tvl');
  return totalTvl.data.reduce((a, i) => a + Number(i.tvl), 0)
}

module.exports = {
  tvl,
}

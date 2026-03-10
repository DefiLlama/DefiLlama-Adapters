const { get } = require("../helper/http");

async function tvl(api) {
  const data = await get('https://humble-api.voi.nautilus.sh/pools/stats?sortBy=tvl')
  let tvl = data.stats.reduce((sum, pool) => sum + Number(pool.tvl.usd), 0)
  return api.addUSDValue(tvl)
}


module.exports = {  
  voi: { tvl },
  algorand: { tvl: () => {} }, // merged with pact-fi
}
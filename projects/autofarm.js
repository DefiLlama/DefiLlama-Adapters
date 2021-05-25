const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/

const bscEndpoint = "https://static.autofarm.network/bsc/farm_data.json"

async function fetch() {
  var bscPools = await utils.fetchURL(bscEndpoint)
  let tvl = Object.values(bscPools.data.pools).reduce((total, pool) => total + (pool.poolWantTVL || 0), 0)
  //var hecototalTvl = await utils.fetchURL('https://api.autofarm.network/heco/get_stats')
  return tvl// + hecototalTvl.data.platformTVL;
}

module.exports = {
  fetch
}

const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  var totalTvl = await utils.fetchURL('https://aave-api-v2.aave.com/data/tvl')
  return totalTvl.data.totalTvl.tvlInUsd;
}

module.exports = {
  fetch
}

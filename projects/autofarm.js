const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  var totalTvl = await utils.fetchURL('https://api.autofarm.network/bsc/get_stats')
  var hecototalTvl = await utils.fetchURL('https://api.autofarm.network/heco/get_stats')
  return totalTvl.data.platformTVL +  hecototalTvl.data.platformTVL;
}

module.exports = {
  fetch
}

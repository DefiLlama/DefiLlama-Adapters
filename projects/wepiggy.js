const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  var totalTvl = await utils.fetchURL('https://gateway.wepiggy.bs.fortop.site/api/v1/market/overview')
  return totalTvl?.data?.data?.supply?.total;
}

module.exports = {
  fetch
}

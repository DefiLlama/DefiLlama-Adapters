const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  var totalTvl = await utils.fetchURL('http://wanstakeinsight.com/wanswap_api/get_tvl')
  return totalTvl.data.result;
}

module.exports = {
  fetch
}

const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  var totalTvl = await utils.fetchURL('https://rpc.zookeeper.finance/api/v1/tvl');
  return totalTvl.data;
}

module.exports = {
  fetch
}

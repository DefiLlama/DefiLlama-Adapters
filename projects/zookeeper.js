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
  fetch,
  methodology: `Zookeeper's TVL is achieved by making a call to it's API: https://rpc.zookeeper.finance/api/v1/tvl.`
}

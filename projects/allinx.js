const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  let staked = await utils.fetchURL('https://api.allinx.io/api/stats')
  return staked.data.data.totalLockedValue;
}

module.exports = {
  fetch
}

const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  const tvl = await utils.fetchURL('https://api.bt.finance/api/stats')
  return tvl.data;
}

module.exports = {
  fetch
}
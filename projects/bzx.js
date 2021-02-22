const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  let staked = await utils.fetchURL('https://api.bzx.network/v1/vault-balance-usd')
  return staked.data.data.all;
}

module.exports = {
  fetch
}

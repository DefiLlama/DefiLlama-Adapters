const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  let staked = await utils.fetchURL('https://api.bzx.network/v1/vault-balance-usd?networks=bsc,eth')
  return Number(staked.data.data.bsc.all) + Number(staked.data.data.eth.all);
}

module.exports = {
  fetch
}

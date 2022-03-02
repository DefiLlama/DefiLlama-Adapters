const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  let staked = await utils.fetchURL('https://api.bzx.network/v1/vault-balance-usd?networks=bsc,eth,polygon')
  return Number(staked.data.data.bsc.all) + Number(staked.data.data.eth.all) + Number(staked.data.data.polygon.all);
}

module.exports = {
  fetch
}

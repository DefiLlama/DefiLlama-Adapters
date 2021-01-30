const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  const { data } = await utils.fetchURL('https://api.defichain.io/v1/listyieldfarming?network=mainnet')
  return data.tvl;
}

module.exports = {
  fetch
}

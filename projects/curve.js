const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  let staked = await utils.fetchURL('https://api.curve.fi/api/getTVL')
  let factory = await utils.fetchURL('https://api.curve.fi/api/getFactoryTVL')
  return staked.data.data.tvl + factory.data.data.factoryBalances;
}

module.exports = {
  fetch
}

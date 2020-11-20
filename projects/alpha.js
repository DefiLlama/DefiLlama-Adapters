const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  var staked = await utils.fetchURL('https://api-homora.alphafinance.io/pools')
  return staked.data.tvlUSD;
}

module.exports = {
  fetch
}

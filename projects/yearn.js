const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  let tvl = await utils.fetchURL('https://api.yearn.tools/tvl')
  return tvl.data.TvlUSD;
}

module.exports = {
  fetch
}

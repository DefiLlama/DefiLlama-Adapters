const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  var tvl = await utils.fetchURL('https://api.growthdefi.com/tvl/wheat-tvl')
  return tvl.data.TVL;
}

module.exports = {
  fetch
}

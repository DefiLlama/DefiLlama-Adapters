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
  fetch,
  methodology: `TVL for Wheat Protocol is achieved by making calls to their API: https://api.growthdefi.com/tvl/wheat-tvl`
}

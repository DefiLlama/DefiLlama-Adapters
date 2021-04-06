const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  var response = await utils.fetchURL('https://api.hyfi.pro/tvl')
  return response.data.tvl;
}

module.exports = {
  fetch
}

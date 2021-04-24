const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  var response = await utils.fetchURL('https://api.hyfi.pro/stat')
  return response.data.vault_tvl;
}

module.exports = {
  fetch
}

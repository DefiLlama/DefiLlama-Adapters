const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/

async function fetch() {
  let response = await utils.fetchURL('https://api-stats.valuedefi.io/api/common-stat/get-total-locked')
  return response.data.data.total
}
fetch().then(console.log)
module.exports = {
  fetch
}
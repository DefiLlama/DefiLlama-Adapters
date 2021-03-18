const utils = require('./helper/utils');

/* * * * * * * *
* ==> Mushrooms Finance TVL adapter.
* response example:
* {
*   "result":4176841.3366126437
* }
*
*****************/
async function fetch() {
  let response = await utils.fetchURL('https://swapoodxoh.execute-api.ap-southeast-1.amazonaws.com/tvl')
  return response.data.result;
}

module.exports = {
  fetch
}

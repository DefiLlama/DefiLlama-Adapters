const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/

async function fetch() {
  let response = await utils.fetchURL('https://staging.unagii.com/api/v1/uvault/tvl')
  return parseFloat(response.data.result.total);

}

module.exports = {
  fetch
}

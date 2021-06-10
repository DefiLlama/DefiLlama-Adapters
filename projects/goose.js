const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/

async function fetch() {
  let response = await utils.fetchURL('https://api.goosedefi.com/getTVL')
  return parseFloat(response.data);

}

module.exports = {
  fetch
}

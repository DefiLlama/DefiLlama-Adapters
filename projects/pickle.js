const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/

async function fetch() {
  let response = await utils.fetchURL('https://api.pickle-jar.info/protocol/value')
  return response.data.totalValue;
}

module.exports = {
  fetch
}

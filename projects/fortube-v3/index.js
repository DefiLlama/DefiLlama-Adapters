const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  let data = await utils.fetchURL('https://api.for.tube/api/v1/bank/public/markets/TVL')
  return data.data
}

module.exports = {
  fetch
}

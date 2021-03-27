const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  let tvl = await utils.fetchURL('https://yearn.science/v1/tvl/latest')
  return tvl.data.tvl;
}

module.exports = {
  fetch
}

const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/

async function fetch() {
  let response = await utils.fetchURL('https://snx-tools.herokuapp.com/widget/collateral')
  return response.data.collateralUSD;

}

module.exports = {
  fetch
}

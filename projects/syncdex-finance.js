const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/

async function fetch() {
  let response = await utils.fetchURL('http://api.syncdex.finance/getTVL')
  return parseFloat(response.data);

}

module.exports = {
  era: {
    fetch
  },
  fetch
}
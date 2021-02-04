const utils = require('./helper/utils');

/* * * * * * * *
* ==> Correct adapter needs to be created.
*
*****************/
async function fetch() {
  var totalTvl = await utils.fetchURL('https://us-central1-dh-alpha.cloudfunctions.net/stats')
  //console.log(totalTvl);
  return totalTvl.data.protocolStats.totalAssetUnderManagement;
}

module.exports = {
  fetch
}

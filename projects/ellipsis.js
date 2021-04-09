const utils = require('./helper/utils');

//needs tidying up

async function fetch() {

  var totalTvl = await utils.fetchURL('https://api.ellipsis.finance/api/getTVL')
  return totalTvl.data.data.total;
}


module.exports = {
  fetch
}

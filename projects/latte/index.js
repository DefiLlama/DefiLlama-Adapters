const utils = require('../helper/utils');

async function fetch() {
  var totalTvl = await utils.fetchURL('https://api.latteswap.com/api/v1/amm/total-value-locked')
  return totalTvl.data
}

module.exports = {
  fetch,
}
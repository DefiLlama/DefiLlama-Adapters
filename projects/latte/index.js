const utils = require('../helper/utils');

async function fetch() {
  var totalTvl = await utils.fetchURL('https://api.latteswap.com/api/v1/amm/defi-llama/tvl-exclude-latte')
  var latteTvl = await utils.fetchURL('https://api.latteswap.com/api/v1/amm/defi-llama/tvl-latte-pool')
  return Number(totalTvl.data) + Number(latteTvl.data)
}

module.exports = {
  fetch,
}
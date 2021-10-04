const utils = require('../helper/utils');

const baseURL = 'https://api.latteswap.com/api'
async function fetch() {
  const totalTvl = await utils.fetchURL(baseURL.concat('/v1/amm/defi-llama/tvl-exclude-latte'))
  const latteTvl = await utils.fetchURL(baseURL.concat('/v1/amm/defi-llama/tvl-latte-pool'))
  return Number(totalTvl.data) + Number(latteTvl.data)
}

module.exports = {
  fetch,
}
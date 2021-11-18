const utils = require('../helper/utils')

async function fetch() {
  const response = await utils.fetchURL('https://apiv3.knit.finance/api/tvl')
  return response.data.data
}

module.exports = {
  fetch
}

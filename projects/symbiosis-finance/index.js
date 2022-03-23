const retry = require('async-retry')
const axios = require("axios");

const apiUrl = 'https://api.symbiosis.finance/explorer/v1/tvl'

async function fetch() {
  return await retry(
    async (bail) => await axios.get(apiUrl),
    { retries: 3 }
  )
}

module.exports = {
  fetch
}
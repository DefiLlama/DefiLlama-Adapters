const { fetchURL } = require('./helper/utils')

async function fetch() {
  const tvl = await fetchURL('https://stats.pembrock.finance/api/tvl')
  return tvl
}

module.exports = {
  fetch
}

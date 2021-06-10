const {fetchURL} = require('./helper/utils')

async function fetch() {
    const tvl = await fetchURL('https://monitor.api.o3swap.com/v1/statistics')
  return tvl.data.data.pool_tvl;
}

module.exports = {
  fetch
}

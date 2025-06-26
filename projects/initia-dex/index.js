const { get } = require('../helper/http')
async function tvl(api) {

  let paginationKey = ''

  do {
    const { pools, pagination } = await get(`https://dex-api.initia.xyz/indexer/dex/v1/pools?type=ALL&pagination.count_total=true&pagination.key=${paginationKey}&pagination.limit=100`)
    paginationKey = pagination.next_key
    pools.forEach(pool => {
      api.addUSDValue(pool.liquidity/1e6)
    })
  } while (paginationKey)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'TVL is calculated as the sum of all pool liquidity',
  initia: {
    tvl
  }
}
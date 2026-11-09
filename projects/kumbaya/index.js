const { getConfig } = require('../helper/cache')
const { get } = require('../helper/http')

const config = {
  megaeth: 'https://exchange.kumbaya.xyz/api/v1/pools/metrics?chainId=4326&limit=100&sortBy=tvl&sortOrder=desc&minTvlETH=0.1'
}

Object.keys(config).forEach(chain => {
  const poolsEndpoint = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const { pools } = await getConfig('kumbaya/'+chain+'/paginated', undefined, {
        fetcher: async () => {
          // pages are sorted by tvl, so a pool can shift across pages between requests: dedup by address
          const pools = {}
          let offset = 0, page
          do {
            page = await get(`${poolsEndpoint}&offset=${offset}`)
            page.pools.forEach(pool => pools[pool.address.toLowerCase()] = pool)
            offset += page.pools.length
          } while (page.hasMore && page.pools.length)
          return { pools: Object.values(pools) }
        }
      })
      return api.sumTokens({ 
        ownerTokens: pools.map(pool => [[pool.token0.address, pool.token1.address], pool.address])
       }) 
      
    }
  }
})

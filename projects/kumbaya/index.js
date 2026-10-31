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
          const pools = []
          for (let offset = 0; offset <= 100000;) {
            const page = await get(`${poolsEndpoint}&offset=${offset}`)
            if (!Array.isArray(page.pools) || typeof page.hasMore !== 'boolean' || (page.hasMore && !page.pools.length))
              throw new Error('Invalid Kumbaya pool page')
            pools.push(...page.pools)
            if (!page.hasMore) return { pools }
            offset += page.pools.length
          }
          throw new Error('Kumbaya pool pagination exceeded the supported offset')
        }
      })
      return api.sumTokens({ 
        ownerTokens: pools.map(pool => [[pool.token0.address, pool.token1.address], pool.address])
       }) 
      
    }
  }
})

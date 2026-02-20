const { getConfig } = require('../helper/cache')

const config = {
  megaeth: 'https://exchange.kumbaya.xyz/api/v1/pools/metrics?chainId=4326&limit=500&sortBy=tvl&sortOrder=desc&aprTrend=up&minTvlETH=0.1'
}

Object.keys(config).forEach(chain => {
  const poolsEndpoint = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const { pools } = await getConfig('kumbaya/'+chain, poolsEndpoint)
      return api.sumTokens({ 
        ownerTokens: pools.map(i => [[i.token0.address, i.token1.address], i.address])
       }) 
      
    }
  }
})
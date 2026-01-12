const { get } = require('../helper/http')
const { transformDexBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ton: {
    tvl: async () => {
      const result = await get("https://api.ston.fi/v1/pools?dex_v2=true")

      // Filter out pools with missing/invalid data to prevent adapter crashes
      // when encountering spam tokens or pools without prices.
      // Pools with zero reserves have no TVL contribution anyway.
      const validPools = result.pool_list.filter(i => 
        i.token0_address && i.token1_address && 
        i.reserve0 && i.reserve1 && 
        +i.reserve0 > 0 && +i.reserve1 > 0
      )

      return transformDexBalances({
        chain: 'ton',
        data: validPools.map(i => ({
          token0: i.token0_address,
          token1: i.token1_address,
          token0Bal: i.reserve0,
          token1Bal: i.reserve1,
        })),
        blacklistedTokens: [
          'EQCKiXahTtXh01KzY6yfj9TAzxdunbv5o9dcHv--cbM2eoHf',
          'EQAsHOPv6QeOuno7MxIhLQYjeSSO-vDb44WVoES4deEad__E',
          'EQA-iWfOSb4tXt_5viDz91V5Kz49Ceyw-WDwiRGiQvrO8D3o'
        ]
      })
    }
  }
}

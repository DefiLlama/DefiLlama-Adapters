const { get } = require('../helper/http')
const { transformDexBalances } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ton: {
    tvl: async () => {
      const result = await get("https://api.ston.fi/v1/pools?dex_v2=true")

      return transformDexBalances({
        chain: 'ton',
        data: result.pool_list.map(i => ({
          token0: i.token0_address,
          token1: i.token1_address,
          token0Bal: i.reserve0,
          token1Bal: i.reserve1,
        }))
      })
    }
  }
}

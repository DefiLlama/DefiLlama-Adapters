const { get } = require('../helper/http')
const { transformDexBalances } = require('../helper/portedTokens')

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ton: {
    tvl: async () => {
      const result = await get("https://api.utyabswap.com/v1/pools")

      return transformDexBalances({
        chain: 'ton',
        data: result.map(i => ({
          token0: i.token0.address,
          token1: i.token1.address,
          token0Bal: i.token0.reserve,
          token1Bal: i.token1.reserve,
        }))
      })
    }
  }
}

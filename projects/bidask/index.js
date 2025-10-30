const { get } = require('../helper/http')
const { transformDexBalances } = require('../helper/portedTokens')

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ton: {
    tvl: async () => {
      const response = await get('https://bidask.finance/api/pools?limit=1000&all=false')
      const pools = response.result;

      return transformDexBalances({
        chain: 'ton',
        data: pools.map(pool => ({
          token0: pool.tokens.token_x.address,
          token1: pool.tokens.token_y.address,
          token0Bal: pool.token_x_amount,
          token1Bal: pool.token_y_amount,
        }))
      })
    }
  }
}

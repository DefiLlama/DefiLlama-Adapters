const { get } = require('../helper/http')
const { transformDexBalances } = require('../helper/portedTokens')

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ton: {
    tvl: async () => {
      const pools = await get('https://api.dedust.io/v1/pools')

      return transformDexBalances({
        chain: 'ton',
        data: pools.map(i => ({
          token0: i.left_token_root,
          token1: i.right_token_root,
          token0Bal: i.left_token_reserve,
          token1Bal: i.right_token_reserve,
        }))
      })
    }
  }
}

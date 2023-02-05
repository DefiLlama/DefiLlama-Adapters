const { get } = require('../helper/http')
const { transformDexBalances } = require('../helper/portedTokens')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  juno: {
    tvl: async () => {
      const data = await get('https://api.hopers.io')
      return transformDexBalances({
        chain: 'juno',
        data: Object.values(data).map(i => ({
          token0: i[0].token ?? i[0].native,
          token0Bal: i[0].amount ?? 0,
          token1: i[1].token ?? i[1].native,
          token1Bal: i[1].amount ?? 0,
        }))
      })
    }
  }
}

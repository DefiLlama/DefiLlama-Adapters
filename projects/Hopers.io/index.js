const { get } = require('../helper/http')
const { transformDexBalances } = require('../helper/portedTokens')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  juno: {
    tvl: async () => {
      const data = await get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=hopers-io&order=market_cap_desc&per_page=100&page=1&sparkline=false
')
      return transformDexBalances({
        chain: 'juno',
        data: Object.values(data).map(i => ({
          tokenA0: i[0].token ?? i[0].native,
          tokenA0Bal: i[0].amount ?? 0,
          tokenA1: i[1].token ?? i[1].native,
          tokenA1Bal: i[1].amount ?? 0,
        }))
      })
    }
  }
}

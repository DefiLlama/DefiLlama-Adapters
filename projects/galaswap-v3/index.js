const { get } = require('../helper/http')

module.exports = {
  misrepresentedTokens: true,
  gala: {
    tvl: async (api) => {
      const data = await get('https://dex-backend-prod1.defi.gala.com/coin-gecko/tickers')
      api.addUSDValue(data.map(i => +i.liquidity_in_usd).reduce((acc, i) => acc + i, 0))
    },
  },
}

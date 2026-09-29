const { get } = require('../helper/http')

const bl = [
  '448bfb148492547b8f96a18ab84c7ac237c310432dada4d137314ee4a025e9a3'
]

module.exports = {
  misrepresentedTokens: true,
  gala: {
    tvl: async (api) => {
      const data = await get('https://dex-backend-prod1.defi.gala.com/coin-gecko/tickers')
      const totalUSDValue = data.filter(i => !bl.includes(i.pool_id)).map(i => +i.liquidity_in_usd).reduce((acc, i) => acc + i, 0)
      if (totalUSDValue > 2e8) throw new Error('TVL too high, check if the API is correct')
      api.addUSDValue(totalUSDValue)
    },
  },
}

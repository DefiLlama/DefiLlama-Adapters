const { get } = require('../helper/http')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  juno: {
    tvl: async () => {
      const data = await get('https://api-junoswap.enigma-validator.com/summary/pools/current/')
      return {
        tether: Object.values(data).reduce((a, i) => a + i.token_liquidity_usd, 0)
      }
    }
  }
}
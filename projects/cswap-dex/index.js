const { get } = require('../helper/http')

module.exports = {
  cardano: {
    tvl: async () => {
      const data = await get('https://api.cswap.fi/api/stats/all')
      return {
        cardano: data.tvl,
      }
    }
  }
}

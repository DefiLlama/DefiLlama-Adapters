const { get } = require('../helper/http')

module.exports = {
  timetravel: false,
  cardano: {
    tvl: async () => {
      const data = await get('https://analytics.indigoprotocol.io/api/cdps')
      return {
        cardano: data.reduce((a, i) => a + (i.collateralAmount/1e6), 0)
      }
    }
  },
}
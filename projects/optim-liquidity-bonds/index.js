const { get } = require('../helper/http')

module.exports = {
  timetravel: false,
  cardano: {
    tvl: async () => {
      const data = await get('https://spo-server.optim.finance/tvl')
      return {
        cardano: data.historicalData.totalLovelace/1e6
      }
    }
  },
};

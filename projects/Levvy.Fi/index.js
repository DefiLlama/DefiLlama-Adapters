const { post } = require('../helper/http')

module.exports = {
  timetravel: false,
  cardano: {
    tvl: async () => {
      const data = await post('https://citizens.theapesociety.io/api/getLevvyData')
      return {
        cardano: data.cardano
      }
    }
  },
}

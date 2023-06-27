const { post } = require('../helper/http')

module.exports = {
  timetravel: false,
  cardano: {
    tvl: async () => {
      const data = await post('https://citizens.theapesociety.io/api/getLevvyData', {})
      return {
        tvl: data.adaTVL,
      }
    }
    borrowed: async () => {
      const data = await post('https://citizens.theapesociety.io/api/getLevvyData', {})
      return {
        borrowed: data.borrowed,
      }
    }
  },
}

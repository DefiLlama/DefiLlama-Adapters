const { post } = require('../helper/http')

module.exports = {
  misrepresentedTokens: true,
  cardano: {
    tvl: async () => {
      const data = await post('https://citizens.theapesociety.io/api/getLevvyData', {})
      return {
        cardano: data.adaTVL,
      }
    },
    borrowed: async () => {
      const data = await post('https://citizens.theapesociety.io/api/getLevvyData', {})
      return {
        cardano: data.borrowed,
      }
    }
  },
}

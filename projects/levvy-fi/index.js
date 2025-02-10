const { post } = require('../helper/http')

module.exports = {
  misrepresentedTokens: true,
  cardano: {
    tvl: async () => {
      const data = await post('https://8080-truthful-birthday-xc2vhr.us1.demeter.run/api/v1/nft/platform/stats', '')
      return {
        cardano: data.totalValueLocked/1e6,
      }
    },
    borrowed: async () => {
      const data = await post('https://8080-truthful-birthday-xc2vhr.us1.demeter.run/api/v1/nft/platform/stats', '')
      return {
        cardano: data.totalValueBorrowed/1e6,
      }
    }
  },
}

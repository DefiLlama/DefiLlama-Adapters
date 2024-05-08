const { get } = require('../helper/http')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  shido: {
    tvl: async () => {
      return {
        tether: 0
      }
    }
  }
}
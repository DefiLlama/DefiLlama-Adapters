const { get } = require('../helper/http')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  juno: {
    tvl: async () => {
      return {
        tether: 0
      }
    }
  }
}

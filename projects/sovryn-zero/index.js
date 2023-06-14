const { get } = require('../helper/http')

module.exports = {
  timetravel: false,
  rsk: {
    tvl: async () => {
      return {
        'bitcoin': (await get('https://backend.sovryn.app/tvl')).tvlZero.BTC_Zero.balance
      }
    }
  }
}
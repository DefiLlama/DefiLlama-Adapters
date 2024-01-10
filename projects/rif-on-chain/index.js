const { get } = require('../helper/http')

module.exports = {
  timetravel: false,
  rsk: {
    tvl: async () => {
      return {
        'rootstock': (await get('https://api.moneyonchain.com/api/calculated/TVL')).btc_in_roc
      }
    }
  }
}
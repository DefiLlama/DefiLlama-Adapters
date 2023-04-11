const { get } = require('../helper/http')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  rsk: {
    tvl: async () => {
      return {
        'tether': (await get('https://backend.sovryn.app/tvl')).tvlAmm.totalUsd
      }
    }
  }
}
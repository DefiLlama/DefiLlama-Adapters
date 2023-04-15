const { get } = require('../helper/http')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  rsk: {
    tvl: async () => {
      // tvlProtocol - margin account tvl
      const { tvlAmm, tvlProtocol, } = await get('https://backend.sovryn.app/tvl')
      return {
        'tether': tvlAmm.totalUsd + tvlProtocol.totalUsd
      }
    }
  }
}
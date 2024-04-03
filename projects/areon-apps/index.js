const { get } = require('../helper/http')

module.exports = {
  timetravel: false,
  areon: {
    tvl: async () => {
      const { result } = await get('https://app-api.areon.network/external/stats')
      return { areon: result.total_area_staked + result.total_area_bonded }
    }
  }
}
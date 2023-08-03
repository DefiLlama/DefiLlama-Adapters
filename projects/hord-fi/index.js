const { get } = require('../helper/http')
module.exports = {
  timetravel: false,
  ethereum: {
    tvl: async () => {
      const { stats } = await get('https://api.hord.app/validators/stats/latest')
      return { ethereum: stats.total_eth_staked }
    }
  }
}
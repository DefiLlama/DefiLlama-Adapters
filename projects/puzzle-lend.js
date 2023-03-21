const { wavesAdapter } = require('./helper/chain/wavesAdapter')

const endpoint = "https://tvl.waves.tech/api/v1/history/puzzlelend"

module.exports = {
  timetravel: false,
  waves: { tvl: wavesAdapter(endpoint, item => item.totalLocked) }
}
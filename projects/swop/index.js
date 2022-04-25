const { wavesAdapter } = require('../helper/wavesAdapter')

const endpoint = "http://51.158.191.108:8002/api/v1/history/swop"

module.exports = {
    timetravel: false,
    waves: {
        tvl: wavesAdapter(endpoint, item => item.totalLocked / 1e6)
    }
}
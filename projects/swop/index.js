const { wavesExport } = require('../helper/chain/wavesAdapter')

const endpoint = "/swop"

module.exports = wavesExport("/swop", item => item.totalLocked / 1e6)
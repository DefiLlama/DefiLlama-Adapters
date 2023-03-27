const { wavesExport } = require('../helper/chain/wavesAdapter')

const endpoint = "/neutrino"

module.exports = wavesExport(endpoint, item => item.usdnLocked + item.defoLocked) 
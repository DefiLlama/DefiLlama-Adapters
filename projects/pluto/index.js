const { wavesExport } = require('../helper/chain/wavesAdapter')
module.exports = wavesExport("/pluto", item => item.totalLocked)
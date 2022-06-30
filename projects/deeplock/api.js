const { getExports } = require('../helper/heroku-api')
const indexExports = require('./index')

module.exports = {
  timetravel: false,
  ...getExports("deeplock", ['bsc']),
}

module.exports.bsc.pool2 = indexExports.bsc.pool2
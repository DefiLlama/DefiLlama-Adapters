const { getExports } = require('../helper/heroku-api')
const indexExports = require('./index')

module.exports = {
  timetravel: false,
  ...getExports("dexpad", ['cronos', 'polygon', 'avax', 'kava']),
}
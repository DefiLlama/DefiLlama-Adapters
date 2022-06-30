const { getExports } = require('../helper/heroku-api')
const config = require('./config')

module.exports = {
  timetravel: false,
  ...getExports("pinksale", Object.keys(config)),
}

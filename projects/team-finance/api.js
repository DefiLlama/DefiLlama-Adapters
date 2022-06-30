const { getExports } = require('../helper/heroku-api')
const config = require('./config')

module.exports = {
  timetravel: false,
  ...getExports("team-finance", ['ethereum', 'bsc', 'polygon', 'avax']),
}

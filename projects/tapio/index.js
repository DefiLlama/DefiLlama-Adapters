const { getExports } = require('../helper/heroku-api')

module.exports = {
  timetravel: false,
  ...getExports("tapio", ['acala']),
}
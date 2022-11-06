const { getExports } = require('../helper/heroku-api')

module.exports = {
  timetravel: false,
  ...getExports('interlay-btc', ['interlay']),
}
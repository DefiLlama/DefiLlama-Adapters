const { getExports } = require('../helper/heroku-api')

module.exports = {
  timetravel: false,
  ...getExports("defichain-loans", ['defichain']),
}
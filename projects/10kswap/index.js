const { getExports } = require('../helper/heroku-api')

module.exports = {
  timetravel: false,
  ...getExports("10kswap", ['starknet']),
}
const { getExports } = require('../helper/heroku-api')

module.exports = {
  timetravel: false,
  ...getExports("parallel-staking", ['heiko', 'parallel']),
}
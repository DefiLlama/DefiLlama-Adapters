const { getExports } = require('../helper/heroku-api')

module.exports = {
  timetravel: false,
  ...getExports("zest-v2", ['stacks'], ['borrowed']),
}
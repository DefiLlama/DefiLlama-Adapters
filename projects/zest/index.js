const { getExports } = require('../helper/heroku-api')

module.exports = {
  timetravel: false,
  methodology: 'counts the number of TAO/alpha tokens of the uni V2 pool.',
  ...getExports("zest", ['stacks'], ['borrowed']),
}
const { getExports } = require('../helper/heroku-api')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  ...getExports("parallel-lending", ['heiko', 'parallel'], ['borrowed']),
}
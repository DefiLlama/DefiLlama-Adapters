const { getExports } = require('../helper/heroku-api')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  ...getExports("hydradex-v3", ['hydra']),
}

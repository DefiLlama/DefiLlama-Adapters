
const hydraExport = require('../hydradex.js')
const { getExports } = require('../helper/heroku-api')

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  ...getExports("hydradex", ['hydra']),
}

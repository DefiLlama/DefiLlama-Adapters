
const { getExports } = require('../helper/heroku-api')

module.exports = {
  methodology: 'TVL is calculated as total hBTC minted on Stacks multiplied by the current share price, expressed in BTC.',
  ...getExports("hermetica-hbtc", ['stacks']),
}

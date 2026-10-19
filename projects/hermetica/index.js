const { getExports } = require('../helper/heroku-api')

module.exports = {
  methodology: 'Counts the number of USDh tokens on Stacks.',
  ...getExports("hermetica", ['stacks']),
}

const { getExports } = require('../helper/heroku-api')

module.exports = {
  timetravel: false,
  ...getExports("jewelswap-lev-farming", ['elrond']),
}

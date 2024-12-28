const { getExports } = require('../helper/heroku-api')

module.exports = {
  timetravel: false,
  ...getExports("jewelswap-nft", ['elrond'], ['borrowed']),
}

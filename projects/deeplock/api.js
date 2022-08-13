const { getExports } = require('../helper/heroku-api')
const indexExports = require('./index')
const chainKeys = Object.keys(indexExports).filter(chain => typeof indexExports[chain] === 'object' && indexExports[chain].tvl)

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  ...getExports("deeplock", chainKeys),
}

module.exports.bsc.pool2 = indexExports.bsc.pool2
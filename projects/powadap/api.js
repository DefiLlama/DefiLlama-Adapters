const { getExports } = require('../helper/heroku-api')
const indexExports = require('./index')
const chainKeys = Object.keys(indexExports).filter(chain => typeof indexExports[chain] === 'object' && indexExports[chain].tvl)


module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  ...getExports("powadap", chainKeys),
}

module.exports = indexExports
module.exports.misrepresentedTokens = true
const { getExports } = require('../helper/heroku-api')
const indexExports = require('./index')
const chainKeys = Object.keys(indexExports).filter(chain => typeof indexExports[chain] === 'object' && indexExports[chain].tvl)

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  ...getExports("team-finance", chainKeys),
}

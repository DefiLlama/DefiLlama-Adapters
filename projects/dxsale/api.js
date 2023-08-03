const { getExports } = require('../helper/heroku-api')
const indexExports = require('./index')
const chainKeys = Object.keys(indexExports).filter(chain => typeof indexExports[chain] === 'object' && indexExports[chain].tvl)

module.exports = {
  hallmarks: [
  // [Math.floor(new Date('2023-03-13') / 1e3), 'Fixed bug that inflated tvl'],
],
  timetravel: false,
  misrepresentedTokens: true,
  ...getExports("dxsale", chainKeys),
}

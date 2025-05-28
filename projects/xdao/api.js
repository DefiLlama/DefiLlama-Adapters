const { getExports } = require('../helper/heroku-api')
const indexExports = require('../xdao')
const chainKeys = Object.keys(indexExports).filter(chain => typeof indexExports[chain] === 'object' && indexExports[chain].tvl)

module.exports = {
  timetravel: false,
  ...getExports("xdao", chainKeys),
  hallmarks: [
    ['2022-10-24', 'Remove governance tokens from tvl'],
  ],
}

const { getExports } = require('../helper/heroku-api')
const indexExports = require('../xdao')
const chainKeys = Object.keys(indexExports).filter(chain => typeof indexExports[chain] === 'object' && indexExports[chain].tvl)

module.exports = {
  timetravel: false,
  ...getExports("xdao", chainKeys),
  hallmarks: [
    [Math.floor(new Date('2022-10-24')/1e3), 'Remove governance tokens from tvl'],
  ],
}

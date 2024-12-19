const { getExports } = require('../helper/heroku-api')

module.exports = {
  deadFrom: '2024-12-01',
  timetravel: false,
  ...getExports("vitcswap", ['vite']),
}
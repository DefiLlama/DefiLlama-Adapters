const { getExports } = require('../helper/heroku-api')

module.exports = {
  ...getExports("interlay-lending", ["interlay", 'interlay'], ['borrowed'])
}

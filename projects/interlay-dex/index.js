const { getExports } = require('../helper/heroku-api')

module.exports = {
  ...getExports("interlay-dex", ["interlay"])
}

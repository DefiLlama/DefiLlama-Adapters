const {getExports} = require('../helper/heroku-api')
const chains = ['ethereum']

module.exports = {
    ...getExports("enzyme", chains)
}
const {getExports} = require('../helper/heroku-api')
const chains = ['ethereum']

module.exports = {
    timetravel: false,
    ...getExports("summer-fi", chains)
}

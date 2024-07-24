const {getExports} = require('../helper/heroku-api')
const chains = ['tron']

module.exports = {
    timetravel: false,
    ...getExports("sunswap-v2", chains)
}

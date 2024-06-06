const {getExports} = require('../helper/heroku-api')
const chains = ['optimism']

module.exports = {
    timetravel: false,
    ...getExports("synthetix", chains)
}

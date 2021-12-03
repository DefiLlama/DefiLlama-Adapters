const {getExports} = require('../helper/heroku-api')
const chains = ['ethereum', 'optimism']

module.exports = {
    timetravel: true,
    ...getExports("synthetix", chains)
}

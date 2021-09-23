const {getExports} = require('../helper/heroku-api')
const chains = ['ethereum', 'optimism']

module.exports = {
    ...getExports("synthetix", chains)
}
const {getExports} = require('../helper/heroku-api')

const chains = ['bsc', 'heco']

module.exports = {
    misrepresentedTokens: true,
    cantRefill: true,
    ...getExports("mdex", chains)
}
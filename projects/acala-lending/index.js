const {getExports} = require('../helper/heroku-api')

module.exports = {
    hallmarks: [
        [1660521600, "aUSD exploit"]
    ],
    timetravel: false,
    misrepresentedTokens: true,
    ...getExports("acala-lending", ['acala'])
}
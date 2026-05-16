const {getExports} = require('../helper/heroku-api')

module.exports = {
    hallmarks: [
        ['2022-08-15', "aUSD exploit"]
    ],
    timetravel: false,
    misrepresentedTokens: true,
    ...getExports("acala-lending", ['acala'])
}
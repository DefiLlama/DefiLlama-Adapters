const {
    getUniTVL
} = require('../helper/unknownTokens')

const chain = 'dogechain'

module.exports = {
    hallmarks: [
        [1663200000, "Rug Pull"]
    ],
    deadFrom: '2022-09-15',
    dogechain: {
        tvl: getUniTVL({
            useDefaultCoreAssets: true,
            factory: '0xbDe460e12B5dcD955e70da8889754958113E988a',
        }),
    },
}
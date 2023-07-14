const {
    getUniTVL
} = require('../helper/unknownTokens')

const chain = 'dogechain'

module.exports = {
    hallmarks: [
        [1663200000, "Rug Pull"]
    ],
    dogechain: {
        tvl: getUniTVL({
            chain,
            useDefaultCoreAssets: true,
            factory: '0xbDe460e12B5dcD955e70da8889754958113E988a',
        }),
    },
}
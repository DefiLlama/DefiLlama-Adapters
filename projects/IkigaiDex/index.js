const {
    getUniTVL
} = require('../helper/unknownTokens')

const chain = 'arbitrum'

module.exports = {
    arbitrum: {
        tvl: getUniTVL({
            chain,
            useDefaultCoreAssets: true,
            factory: '0x764E6581B5A88C8D9C5e4eAe204A3d234dA8068b',
        }),
    },
}
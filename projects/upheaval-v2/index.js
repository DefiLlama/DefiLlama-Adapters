const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    hyperliquid: {
        tvl: getUniTVL({
            factory: '0x98e19A533FadB2C9853983772E4e7aa09a1478e0',
            chain: 'hyperliquid',
        })
    }
}
const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    misrepresentedTokens: true,
    prom: {
        tvl: getUniTVL({
            useDefaultCoreAssets: true,
            factory: '0x0e2b8eE0A672AD9A0eA0434cC93557CDb5eF3f19',
        })
    }
}

const {getUniTVL} = require('../helper/unknownTokens')

module.exports = {
    xdai: {
        tvl: getUniTVL({
            factory: '0x45DE240fbE2077dd3e711299538A09854FAE9c9b',
            fetchBalances: true,
            useDefaultCoreAssets: true,
        })
    }
}
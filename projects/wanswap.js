const {getUniTVL} = require('./helper/unknownTokens')

module.exports = {
    wan: {
        tvl: getUniTVL({
            factory: '0x1125C5F53C72eFd175753d427aA116B972Aa5537',
            fetchBalances: true,
            useDefaultCoreAssets: true,
        })
    }
}
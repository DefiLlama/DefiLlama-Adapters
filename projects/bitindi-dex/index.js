const {getUniTVL} = require('../helper/unknownTokens')

module.exports = {
    bitindi: {
        tvl: getUniTVL({
            factory: '0x87cef801D44D6eDa8106087e7676153c30e36950',
            fetchBalances: true,
            useDefaultCoreAssets: true,
        })
    }
}
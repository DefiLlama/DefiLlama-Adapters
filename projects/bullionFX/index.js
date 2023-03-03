const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    ethereum: {
        tvl: getUniTVL({
            factory: '0x5E7CfE3DB397d3DF3F516d79a072F4C2ae5f39bb',
            fetchBalances: true,
            useDefaultCoreAssets: true,
        })
    }
}
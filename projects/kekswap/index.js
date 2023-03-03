const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
    kekchain: {
        tvl: getUniTVL({
            factory: '0x558e20804CDFff6d98945b12CE47FeB46D6a4Dc4',
            fetchBalances: true,
            useDefaultCoreAssets: true,
        }),
    }
}
const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
    kekchain: {
        tvl: getUniTVL({
            factory: '0xfe0139503a1B97F7f6c2b72f4020df7A6c1EE399',
            fetchBalances: true,
            useDefaultCoreAssets: true,
        }),
    }
}

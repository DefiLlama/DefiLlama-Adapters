const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
    bsc: {
        tvl: getUniTVL({
            factory: '0x3165d94dd2f71381495cb897832de02710a0dce5',
            fetchBalances: true,
            useDefaultCoreAssets: true,
        }),
    }
}

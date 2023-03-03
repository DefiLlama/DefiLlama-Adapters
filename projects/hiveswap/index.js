const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
    map: {
        tvl: getUniTVL({
            factory: '0x29c3d087302e3fCb75F16175A09E4C39119459B2',
            fetchBalances: true,
            useDefaultCoreAssets: true,
        }),
    }
}
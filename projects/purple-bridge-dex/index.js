const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
    misrepresentedTokens: true,
    polygon: {
        tvl: getUniTVL({factory: '0x9c9238b2E47D61482D36deaFcDCD448D8bAAd75b', useDefaultCoreAssets: true, }),
    }
}
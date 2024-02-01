const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
    zeta: {
        tvl: getUniTVL({ factory: "0x61db4eecb460b88aa7dcbc9384152bfa2d24f306", useDefaultCoreAssets: true, })
    }
};
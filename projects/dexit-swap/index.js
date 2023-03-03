const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
    dexit: {
        tvl: getUniTVL({
            factory: '0xed7e00862c73eF3a53f33d785c62d312Cc8827d2',
            fetchBalances: true,
            useDefaultCoreAssets: true,
        }),
    }
}
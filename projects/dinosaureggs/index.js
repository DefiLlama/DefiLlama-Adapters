const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
    bsc: {
        tvl: getUniTVL({
            factory: '0x73d9f93d53505cb8c4c7f952ae42450d9e859d10',
            fetchBalances: true,
            useDefaultCoreAssets: true,
        }),
    }
}

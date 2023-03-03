const { getUniTVL } = require("../helper/unknownTokens");
const crow = "0x285c3329930a3fd3C7c14bC041d3E50e165b1517";

module.exports = {
    cronos: {
        tvl: getUniTVL({
            factory: '0xDdcf30c1A85e5a60d85310d6b0D3952A75a00db4',
            fetchBalances: true,
            useDefaultCoreAssets: true,
        }),
    }
}
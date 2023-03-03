const { getUniTVL } = require("../helper/unknownTokens");

module.exports = {
    fantom: {
        tvl: getUniTVL({
            factory: '0x08b3CCa975a82cFA6f912E0eeDdE53A629770D3f',
            fetchBalances: true,
            useDefaultCoreAssets: true,
        }),
    }
}

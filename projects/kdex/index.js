const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
    misrepresentedTokens: true,
    methodology: "Factory addresses (0x9a6d197e85e61c23146F5b7FA55fc8a6EDDD2D57 for kava) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    kava: {
        tvl: getUniTVL({
            factory: '0x9a6d197e85e61c23146F5b7FA55fc8a6EDDD2D57',
            useDefaultCoreAssets: true,
        }),
    }
}
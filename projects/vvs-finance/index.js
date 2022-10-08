const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x3b44b2a187a7b3824131f8db5a74194d0a42fc15) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    cronos: {
        tvl: getUniTVL({
            chain: 'cronos',
            factory: '0x3b44b2a187a7b3824131f8db5a74194d0a42fc15',
            useDefaultCoreAssets: true,
        })
    }
}
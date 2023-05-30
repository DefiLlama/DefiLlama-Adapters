const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x09fafa5eecbc11C3e5d30369e51B7D9aab2f3F53) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    ethereumclassic: {
        tvl: getUniTVL({
            factory: '0x09fafa5eecbc11C3e5d30369e51B7D9aab2f3F53',
            useDefaultCoreAssets: true,
        })
    }
}
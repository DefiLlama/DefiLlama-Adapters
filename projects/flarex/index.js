const { getUniTVL } = require('../helper/unknownTokens')
const sdk = require('@defillama/sdk')

const v1 =getUniTVL({ factory: '0x0eAC91966b12b81db18f59D8e893b9ccef7e2c30', useDefaultCoreAssets: true })
const v2 =getUniTVL({ factory: '0x7a39408809441814469A8Fb3F5CFea1aA2774fB6', useDefaultCoreAssets: true })

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x7a39408809441814469A8Fb3F5CFea1aA2774fB6 - songbird, 0x28b70f6Ed97429E40FE9a9CD3EB8E86BCBA11dd4 - flare) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    songbird: {
        tvl:sdk.util.sumChainTvls([v1,v2])
    },
    flare:{
        tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0x28b70f6Ed97429E40FE9a9CD3EB8E86BCBA11dd4' }),
    }
}
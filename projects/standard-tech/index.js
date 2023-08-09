const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
    timetravel: true,
    misrepresentedTokens: true,
    methodology: "Factory address (0x073386AE3292299a5814B00bC1ceB8f2bfC92c51) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    shiden: {
        tvl: getUniTVL({ factory: '0x073386AE3292299a5814B00bC1ceB8f2bfC92c51', chain: 'shiden', useDefaultCoreAssets: true }),
    },
    ethereum: {
        tvl: getUniTVL({ factory: '0x53AC1d1FA4F9F6c604B8B198cE29A50d28cbA893', chain: 'ethereum', useDefaultCoreAssets: true }),
    },
    metis: {
        tvl: getUniTVL({ factory: '0xFA68bAAdBDCf014fA20bD1A4542967AE40Ddca53', chain: 'metis', useDefaultCoreAssets: true }),
    }
}

const { getUniTVL } = require('../helper/unknownTokens')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x50704Ac00064be03CEEd817f41E0Aa61F52ef4DC) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    cronos_zkevm: {
        tvl: getUniTVL({
            factory: '0x50704Ac00064be03CEEd817f41E0Aa61F52ef4DC',
            useDefaultCoreAssets: true,
        })
    }
}
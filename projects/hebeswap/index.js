const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    timetravel: true,
    misrepresentedTokens: true,
    methodology: "Factory address (0x09fafa5eecbc11C3e5d30369e51B7D9aab2f3F53) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    ethereumclassic: {
        tvl:calculateUsdUniTvl("0x09fafa5eecbc11C3e5d30369e51B7D9aab2f3F53", "ethereumclassic", "0x82A618305706B14e7bcf2592D4B9324A366b6dAd", ["0x88d8C3Dc6B5324f34E8Cf229a93E197048671abD"
        ], "ethereum-classic")
    }
}
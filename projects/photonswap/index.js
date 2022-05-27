const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x462C98Cae5AffEED576c98A55dAA922604e2D875) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    cronos: {
        tvl:calculateUsdUniTvl(
            "0x462C98Cae5AffEED576c98A55dAA922604e2D875", 
            "cronos", 
            "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23", 
            [
                //PHOTON
                "0xbdd4e5660839a088573191A9889A262c0Efc0983",
                //USDC 
                "0xc21223249ca28397b4b6541dffaecc539bff0c59"
            ], 
            "crypto-com-chain")
    }
}
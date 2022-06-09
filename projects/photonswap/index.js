const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory addresses (0x462C98Cae5AffEED576c98A55dAA922604e2D875 for cronos, 0x4FD2c40c25Dd40e9Bf0CE8479bA384178b8671b5 for kava, 0x1c671d6fEC45Ec0de88C82e6D8536bFe33F00c8a for evmos) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
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
    },
    evmos: {
        tvl:calculateUsdUniTvl(
            "0x1c671d6fEC45Ec0de88C82e6D8536bFe33F00c8a", 
            "evmos", 
            "0xD4949664cD82660AaE99bEdc034a0deA8A0bd517", 
            [
                //PHOTON
                "0xA8eFf8BB28c6193CBE8BcFb8276e9b1dD3380B13",
                //USDC 
                "0x51e44FfaD5C2B122C8b635671FCC8139dc636E82"
            ], 
            "evmos")
    },
    kava: {
        tvl:calculateUsdUniTvl(
            "0x4FD2c40c25Dd40e9Bf0CE8479bA384178b8671b5", 
            "kava", 
            "0xc86c7C0eFbd6A49B35E8714C5f59D99De09A225b", 
            [
                //PHOTON
                "0xA8eFf8BB28c6193CBE8BcFb8276e9b1dD3380B13",
                //USDC 
                "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f"
            ], 
            "kava")
    }
}

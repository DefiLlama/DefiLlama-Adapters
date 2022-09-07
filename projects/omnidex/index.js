const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')

module.exports={
    telos:{
        tvl: calculateUsdUniTvl(
            "0x7a2A35706f5d1CeE2faa8A254dd6F6D7d7Becc25",
            "telos",
            "0xD102cE6A4dB07D247fcc28F366A623Df0938CA9E",
            [
                "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f", //weth
                "0xf390830df829cf22c53c8840554b98eafc5dcbc2", //btc
                "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b", //usdc
                "0xd2504a02fABd7E546e41aD39597c377cA8B0E1Df", //charm
            ],
            "telos"
          )
    }
}
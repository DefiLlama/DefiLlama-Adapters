const { calculateUsdUniTvl } = require('./helper/getUsdUniTvl')

module.exports = {
    misrepresentedTokens: true,
    moonbeam: {
        tvl: calculateUsdUniTvl(
            "0x19B85ae92947E0725d5265fFB3389e7E4F191FDa", 
            "moonbeam", 
            "0xAcc15dC74880C9944775448304B263D191c6077F",
            [
                "0xE3e43888fa7803cDC7BEA478aB327cF1A0dc11a7",
                "0x8f552a71EFE5eeFc207Bf75485b356A0b3f01eC9",
                "0x6763CfD3cfc88Bce52DFAC3A9346C55b43e48DEF",
                '0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b',
                "0x0DB6729C03C85B0708166cA92801BcB5CAc781fC"
            ],  
            "moonbeam"
        ),
    }
}

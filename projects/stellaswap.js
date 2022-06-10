const { calculateUsdUniTvl } = require('./helper/getUsdUniTvl')

module.exports = {
    misrepresentedTokens: true,
    moonbeam: {
        tvl: calculateUsdUniTvl(
            "0x68A384D826D3678f78BB9FB1533c7E9577dACc0E", // factory
            "moonbeam", 
            "0xAcc15dC74880C9944775448304B263D191c6077F", // WGLMR
            [
                "0x0E358838ce72d5e61E0018a2ffaC4bEC5F4c88d2", // Stella token
                '0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b', // USDC
            ],  
            "moonbeam"
        ),
    }
}

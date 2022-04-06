const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')

const WASTR = "0xEcC867DE9F5090F55908Aaa1352950b9eed390cD" // their own barely used version

module.exports = {
    misrepresentedTokens: true,
    astar: {
        tvl: calculateUsdUniTvl("0x95f506E72777efCB3C54878bB4160b00Cd11cd84", "astar", WASTR,
            [
                '0xEcC867DE9F5090F55908Aaa1352950b9eed390cD', // ASTAR
                '0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98', // USDC
                '0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E', // BUSD
            ], "astar"),
    }
}

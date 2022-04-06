const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')

const WASTR = "0xEcC867DE9F5090F55908Aaa1352950b9eed390cD" // their own barely used version

module.exports = {
    misrepresentedTokens: true,
    methodology: "Astar Exchange Tvl Calculation",
    astar: {
        tvl: calculateUsdUniTvl("0x95f506E72777efCB3C54878bB4160b00Cd11cd84", "astar", WASTR,
            [
                '0xEcC867DE9F5090F55908Aaa1352950b9eed390cD', // ASTAR
                '0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98', // USDC
                '0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF', // MATIC
                '0x75364D4F779d0Bd0facD9a218c67f87dD9Aff3b4', // WSDN
                '0x7f27352D5F83Db87a5A3E00f4B07Cc2138D8ee52', // BNB
            ], "astar"),
    }
}

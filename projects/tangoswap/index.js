const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')

const TANGO = "0x73BE9c8Edf5e951c9a0762EA2b1DE8c8F38B5e91"
module.exports = {
    methodology: "Count TVL as liquidity on the dex",
    misrepresentedTokens: true,
    smartbch: {
        tvl: calculateUsdUniTvl(
            "0x2F3f70d13223EDDCA9593fAC9fc010e912DF917a",
            "smartbch",
            "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04",
            [TANGO],
            "bitcoin-cash"
        ),
    }
}

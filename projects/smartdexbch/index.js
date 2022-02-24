const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')

const DSMART = "0x47c259DFe165Cef3e429C9B66bf9ce9dc3e68aC2"
module.exports = {
    methodology: "Count TVL as liquidity on the dex",
    misrepresentedTokens: true,
    smartbch: {
        tvl: calculateUsdUniTvl(
            "0xDd749813a4561100bDD3F50079a07110d148EaF5",
            "smartbch",
            "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04",
            [DSMART],
            "bitcoin-cash"
        ),
    }
}
const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')
const { stakingPricedLP } = require('../helper/staking')

const SMART = "0x6e6D4ECE35EEd638A1153339F69E543B7ae5F776";
const DSMART = "0x47c259DFe165Cef3e429C9B66bf9ce9dc3e68aC2";
const xDSMART = "0x46269c22848738573761eC50a736916272857f83";
const FLEXUSD = "0x7b2B3C5308ab5b2a1d9a94d20D35CCDf61e05b72";
const WBCH = "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04";
const FACTORY = "0xDd749813a4561100bDD3F50079a07110d148EaF5";
const DSMART_WBCH_PAIR = "0xce6c8D26d370C18618DEE42a18190624105B212F"

module.exports = {
    methodology: "Count TVL as liquidity on the dex",
    misrepresentedTokens: true,
    smartbch: {
        tvl: calculateUsdUniTvl(
            FACTORY,
            "smartbch",
            WBCH,
            [SMART, DSMART, FLEXUSD],
            "bitcoin-cash"
        ),
        staking: stakingPricedLP(xDSMART, DSMART, 'smartbch', DSMART_WBCH_PAIR, 'bitcoin-cash', false, 18)
    }
}
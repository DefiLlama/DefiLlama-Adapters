const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')
const { staking } = require('../helper/staking')

const TANGO = "0x73BE9c8Edf5e951c9a0762EA2b1DE8c8F38B5e91"
const xTANGO = "0x98Ff640323C059d8C4CB846976973FEEB0E068aA";
const FLEXUSD = "0x7b2B3C5308ab5b2a1d9a94d20D35CCDf61e05b72";
const WBCH = "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04";
const FACTORY = "0x2F3f70d13223EDDCA9593fAC9fc010e912DF917a";

module.exports = {
    methodology: "Count TVL as liquidity on the dex",
    misrepresentedTokens: true,
    smartbch: {
        tvl: calculateUsdUniTvl(
            FACTORY,
            "smartbch",
            WBCH,
            [TANGO, FLEXUSD],
            "bitcoin-cash"
        ),
        staking: staking(xTANGO, TANGO, 'smartbch', 'tangoswap', 18)
    }
}

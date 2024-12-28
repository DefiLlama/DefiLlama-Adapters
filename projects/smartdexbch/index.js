const { getUniTVL } = require('../helper/unknownTokens')
const { stakingPricedLP } = require('../helper/staking')

const DSMART = "0x47c259DFe165Cef3e429C9B66bf9ce9dc3e68aC2";
const xDSMART = "0x46269c22848738573761eC50a736916272857f83";
const FACTORY = "0xDd749813a4561100bDD3F50079a07110d148EaF5";
const DSMART_WBCH_PAIR = "0xce6c8D26d370C18618DEE42a18190624105B212F"

module.exports = {
    methodology: "Count TVL as liquidity on the dex",
    misrepresentedTokens: true,
    smartbch: {
        tvl: getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true }),
        staking: stakingPricedLP(xDSMART, DSMART, 'smartbch', DSMART_WBCH_PAIR, 'bitcoin-cash', false, 18)
    }
}
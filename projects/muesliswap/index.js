const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x72cd8c0B5169Ff1f337E2b8F5b121f8510b52117) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    smartbch: {
        tvl:calculateUsdUniTvl("0x72cd8c0B5169Ff1f337E2b8F5b121f8510b52117", "smartbch", "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04", ["0xc8E09AEdB3c949a875e1FD571dC4b3E48FB221f0"], "bitcoin-cash")
    }
}
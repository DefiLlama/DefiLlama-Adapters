const { getUniTVL } = require('../helper/unknownTokens')
const { stakingPriceLP } = require('../helper/staking')


module.exports = {
    misrepresentedTokens: true,
    timetravel: false,
    methodology: "The factory addresses are used to find the LP pairs on Smart BCH and Milkomeda. For Cardano we calculate the tokens on resting orders on the order book contracts. TVL is equal to the liquidity on the AMM plus the open orders in the order book",
    smartbch: {
        tvl: getUniTVL({ factory: '0x72cd8c0B5169Ff1f337E2b8F5b121f8510b52117', useDefaultCoreAssets: true }),
        staking: stakingPriceLP("0x4856BB1a11AF5514dAA0B0DC8Ca630671eA9bf56", "0xc8E09AEdB3c949a875e1FD571dC4b3E48FB221f0", "0x599061437d8455df1f86d401FCC2211baaBC632D", "bitcoin-cash", false, 18)
    },
   
}
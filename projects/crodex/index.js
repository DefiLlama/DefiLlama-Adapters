const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0xe9c29cB475C0ADe80bE0319B74AD112F1e80058F) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    cronos: {
        tvl:calculateUsdUniTvl("0xe9c29cB475C0ADe80bE0319B74AD112F1e80058F", "cronos", "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23", [""], "crypto-com-chain")
    }
}
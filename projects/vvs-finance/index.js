const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x3b44b2a187a7b3824131f8db5a74194d0a42fc15) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    cronos: {
        tvl:calculateUsdUniTvl("0x3b44b2a187a7b3824131f8db5a74194d0a42fc15", "cronos", "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23", ["0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03"], "crypto-com-chain")
    }
}
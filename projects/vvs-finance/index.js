const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x3b44b2a187a7b3824131f8db5a74194d0a42fc15) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    cronos: {
        tvl:calculateUsdUniTvl("0x3b44b2a187a7b3824131f8db5a74194d0a42fc15", "cronos", "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23", 
        [
            "0x2D03bECE6747ADC00E1a131BBA1469C15fD11e03", //vvs
            "0xc21223249ca28397b4b6541dffaecc539bff0c59", //usdc
            "0xe44fd7fcb2b1581822d0c862b68222998a0c299a", //weth
            "0x66e428c3f67a68878562e79a0234c1f83c208770", //usdt
        ]
        , "crypto-com-chain")
    }
}
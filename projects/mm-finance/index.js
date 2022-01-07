const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0xd590cC180601AEcD6eeADD9B7f2B7611519544f4) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    cronos: {
        tvl:calculateUsdUniTvl("0xd590cC180601AEcD6eeADD9B7f2B7611519544f4", "cronos", "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23", 
        [
            "0xbA452A1c0875D33a440259B1ea4DcA8f5d86D9Ae", //mmf
            "0xc21223249ca28397b4b6541dffaecc539bff0c59", //usdc
            "0xe44fd7fcb2b1581822d0c862b68222998a0c299a", //weth
            "0x66e428c3f67a68878562e79a0234c1f83c208770", //usdt
            "0x062E66477Faf219F25D27dCED647BF57C3107d52", //wbtc
        ]
        , "crypto-com-chain")
    }
}
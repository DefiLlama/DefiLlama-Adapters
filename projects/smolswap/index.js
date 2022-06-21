const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')
const { stakingPricedLP } = require('../helper/staking')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x7Aa2149fF9EF4A09D4ace72C49C26AaE8C89Fb48) is used to find the LP pairs. TVL is equal to the liquidity on the AMM, while staking is the amount of SMOL tokens found in the Masterchef(0x66a5f06d9c8bdc27bb0768eeff71d22b468fb464).",
    cronos: {
        tvl:calculateUsdUniTvl("0x7Aa2149fF9EF4A09D4ace72C49C26AaE8C89Fb48", "cronos", "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23", 
        [
            "0x2Ad63Da83d6ff5dA9E716DcaE844D4f157405BDd",
            "0xc21223249ca28397b4b6541dffaecc539bff0c59",   // USDC
            "0xe44fd7fcb2b1581822d0c862b68222998a0c299a",   // WETH
            "0x062e66477faf219f25d27dced647bf57c3107d52",   // WBTC
            "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f",   // BNB
            "0x0dCb0CB0120d355CdE1ce56040be57Add0185BAa",   // AUTO
        ], "crypto-com-chain"),
        staking: stakingPricedLP(
            "0x66a5f06d9c8bdc27bb0768eeff71d22b468fb464", 
            "0x2Ad63Da83d6ff5dA9E716DcaE844D4f157405BDd", 
            "cronos", 
            "0x408b982fDC78eA8fdF8f8652C7893181A645d782", 
            "crypto-com-chain",
            true
        )
    }
}
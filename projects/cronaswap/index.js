const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')
const { stakingPricedLP } = require('../helper/staking')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x73A48f8f521EB31c55c0e1274dB0898dE599Cb11) is used to find the LP pairs. TVL is equal to the liquidity on the AMM, while staking is the amount of CRONA tokens found in the Masterchef(0x77ea4a4cF9F77A034E4291E8f457Af7772c2B254).",
    cronos: {
        tvl:calculateUsdUniTvl(
            "0x73A48f8f521EB31c55c0e1274dB0898dE599Cb11", 
            "cronos", "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23", 
            [
                //CRONA
                "0xadbd1231fb360047525BEdF962581F3eee7b49fe",
                //USDC
                "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59",
                //BUSD
                "0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8",
                //USDT
                "0x66e428c3f67a68878562e79A0234c1F83c208770",
                //DAI
                "0xF2001B145b43032AAF5Ee2884e456CCd805F677D"
            ], "crypto-com-chain"),
        staking: stakingPricedLP("0x77ea4a4cF9F77A034E4291E8f457Af7772c2B254", "0xadbd1231fb360047525BEdF962581F3eee7b49fe", "cronos", "0xeD75347fFBe08d5cce4858C70Df4dB4Bbe8532a0", "crypto-com-chain")
    }
}
const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')
const { stakingPricedLP } = require('../helper/staking')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x73A48f8f521EB31c55c0e1274dB0898dE599Cb11) is used to find the LP pairs. TVL is equal to the liquidity on the AMM, while staking is the amount of tokens found in the Masterchef(0xbf0929439Ea073d55DE8bd0F6e0293Ec30e42Df8).",
    cronos: {
        tvl:calculateUsdUniTvl(
            "0x73A48f8f521EB31c55c0e1274dB0898dE599Cb11",
            "cronos", "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
            [
                //GENESIS
                "0x2638bE7B0d033A59cbcA9139B470503F0a711379",
                //USDC
                "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59",
                //BUSD
                "0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8",
                //USDT
                "0x66e428c3f67a68878562e79A0234c1F83c208770",
                //DAI
                "0xF2001B145b43032AAF5Ee2884e456CCd805F677D"
            ], "crypto-com-chain"),
        staking: stakingPricedLP("0xbf0929439Ea073d55DE8bd0F6e0293Ec30e42Df8", "0x2638bE7B0d033A59cbcA9139B470503F0a711379", "cronos", "0xd9C68748E3739639262946406d3cbA323Ea6E2b9", "crypto-com-chain")
    }
}

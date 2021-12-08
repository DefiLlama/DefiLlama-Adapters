const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')
const { stakingPricedLP } = require('../helper/staking')
module.exports = {
    misrepresentedTokens: true,
    methodology: "Factory address (0x33c04bD4Ae93336BbD1024D709f4A313cC858EBe) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    cronos: {
        tvl: calculateUsdUniTvl("0x33c04bD4Ae93336BbD1024D709f4A313cC858EBe", "cronos", "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23", [
            //KRX
            "0xF0681BB7088Ac68A62909929554Aa22ad89a21fB",
            //CRONA
            "0xadbd1231fb360047525BEdF962581F3eee7b49fe",
            //USDC
            "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59",
            //BUSD
            "0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8",
            //USDT
            "0x66e428c3f67a68878562e79A0234c1F83c208770",
            //DAI
            "0xF2001B145b43032AAF5Ee2884e456CCd805F677D"], "crypto-com-chain"),
        staking: stakingPricedLP("0x53cE820Ed109D67746a86b55713E30252275c127", "0xF0681BB7088Ac68A62909929554Aa22ad89a21fB", "cronos", "0xD2219106310E46D7FD308c0eC9d9FCc2d2c8a9B5", "crypto-com-chain")
    }
}
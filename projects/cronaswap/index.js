const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')
const { stakingPricedLP } = require('../helper/staking')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x73A48f8f521EB31c55c0e1274dB0898dE599Cb11) is used to find the LP pairs. TVL is equal to the liquidity on the AMM, while staking is the amount of CRONA tokens found in the Masterchef(0x77ea4a4cF9F77A034E4291E8f457Af7772c2B254).",
    cronos: {
        tvl:calculateUsdUniTvl("0x73A48f8f521EB31c55c0e1274dB0898dE599Cb11", "cronos", "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23", ["0xadbd1231fb360047525BEdF962581F3eee7b49fe"], "crypto-com-chain"),
        staking: stakingPricedLP("0x77ea4a4cF9F77A034E4291E8f457Af7772c2B254", "0xadbd1231fb360047525BEdF962581F3eee7b49fe", "cronos", "0xeD75347fFBe08d5cce4858C70Df4dB4Bbe8532a0", "crypto-com-chain")
    }
}
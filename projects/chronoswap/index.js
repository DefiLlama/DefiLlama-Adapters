const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')
const { stakingPricedLP } = require('../helper/staking')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x6C50Ee65CFcfC59B09C570e55D76daa7c67D6da5) is used to find the LP pairs. TVL is equal to the liquidity on the AMM, while staking is the amount of CRONA tokens found in the Masterchef(0x77ea4a4cF9F77A034E4291E8f457Af7772c2B254).",
    cronos: {
        tvl:calculateUsdUniTvl("0x6C50Ee65CFcfC59B09C570e55D76daa7c67D6da5", "cronos", "0xca2503482e5D6D762b524978f400f03E38d5F962", ["0x322e21dcAcE43d319646756656b29976291d7C76"], "crypto-com-chain"),
        staking: stakingPricedLP("0x3790F3A1cf8A478042Ec112A70881Dcfa9c7fd2a", "0x322e21dcAcE43d319646756656b29976291d7C76", "cronos", "0x4bbce14d69f9fea118992f1944c084753f1b0bf9", "crypto-com-chain")
    }
}
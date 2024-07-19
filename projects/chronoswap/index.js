const { getUniTVL } = require('../helper/unknownTokens')
const { stakingPricedLP } = require('../helper/staking')
const sdk = require("@defillama/sdk")

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x6C50Ee65CFcfC59B09C570e55D76daa7c67D6da5) is used to find the LP pairs. TVL is equal to the liquidity on the AMM, while staking is the amount of CNO & CBO tokens found in the Masterchefs(0x77ea4a4cF9F77A034E4291E8f457Af7772c2B254,0xaBAD73Be9fd441731ADb007AdB6C1b03e730A8e0).",
    cronos: {
        tvl: getUniTVL({ factory: '0x6C50Ee65CFcfC59B09C570e55D76daa7c67D6da5', useDefaultCoreAssets: true }),
        staking: sdk.util.sumChainTvls([
            stakingPricedLP("0xaBAD73Be9fd441731ADb007AdB6C1b03e730A8e0", "0xA46d5775c18837e380eFB3d8Bf9D315bcd028AB1", "cronos", "0x9b76213969885044FeF03AFCc08d3F4039768F7e", "crypto-com-chain"),
            stakingPricedLP("0x3790F3A1cf8A478042Ec112A70881Dcfa9c7fd2a", "0x322e21dcAcE43d319646756656b29976291d7C76", "cronos", "0x4bbce14d69f9fea118992f1944c084753f1b0bf9", "crypto-com-chain")        

        ]) 
    }
}
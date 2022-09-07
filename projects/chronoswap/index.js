const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')
const { stakingPricedLP } = require('../helper/staking')
const sdk = require("@defillama/sdk")

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x6C50Ee65CFcfC59B09C570e55D76daa7c67D6da5) is used to find the LP pairs. TVL is equal to the liquidity on the AMM, while staking is the amount of CNO & CBO tokens found in the Masterchefs(0x77ea4a4cF9F77A034E4291E8f457Af7772c2B254,0xaBAD73Be9fd441731ADb007AdB6C1b03e730A8e0).",
    cronos: {
        tvl:calculateUsdUniTvl(
            "0x6C50Ee65CFcfC59B09C570e55D76daa7c67D6da5", 
            "cronos", 
            "0xca2503482e5D6D762b524978f400f03E38d5F962", 
            [
                "0x322e21dcAcE43d319646756656b29976291d7C76",
                "0xA46d5775c18837e380eFB3d8Bf9D315bcd028AB1",
                "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59",
                "0xE2589867ad472bD1Aa46407c182E13c08f8Eadc9",
                "0x66e428c3f67a68878562e79A0234c1F83c208770",
                "0xe44Fd7fCb2b1581822D0c862B68222998a0c299a",
                "0x062E66477Faf219F25D27dCED647BF57C3107d52",
                "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f",
                "0xc9BAA8cfdDe8E328787E29b4B078abf2DaDc2055"
            ], 
            "crypto-com-chain"),
        staking: sdk.util.sumChainTvls([
            stakingPricedLP("0xaBAD73Be9fd441731ADb007AdB6C1b03e730A8e0", "0xA46d5775c18837e380eFB3d8Bf9D315bcd028AB1", "cronos", "0x9b76213969885044FeF03AFCc08d3F4039768F7e", "crypto-com-chain"),
            stakingPricedLP("0x3790F3A1cf8A478042Ec112A70881Dcfa9c7fd2a", "0x322e21dcAcE43d319646756656b29976291d7C76", "cronos", "0x4bbce14d69f9fea118992f1944c084753f1b0bf9", "crypto-com-chain")        

        ]) 
    }
}
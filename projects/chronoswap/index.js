const { getUniTVL } = require('../helper/unknownTokens')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x6C50Ee65CFcfC59B09C570e55D76daa7c67D6da5) is used to find the LP pairs. TVL is equal to the liquidity on the AMM, while staking is the amount of CNO & CBO tokens found in the Masterchefs(0x77ea4a4cF9F77A034E4291E8f457Af7772c2B254,0xaBAD73Be9fd441731ADb007AdB6C1b03e730A8e0).",
    cronos: {
        tvl: getUniTVL({ factory: '0x6C50Ee65CFcfC59B09C570e55D76daa7c67D6da5', useDefaultCoreAssets: true }),
        staking: sumTokensExport({
            tokensAndOwners: [
                ["0xA46d5775c18837e380eFB3d8Bf9D315bcd028AB1", "0xaBAD73Be9fd441731ADb007AdB6C1b03e730A8e0"], // CNO in masterchef
                ["0x322e21dcAcE43d319646756656b29976291d7C76", "0x3790F3A1cf8A478042Ec112A70881Dcfa9c7fd2a"], // CBO in masterchef
            ],
        }),
    }
}
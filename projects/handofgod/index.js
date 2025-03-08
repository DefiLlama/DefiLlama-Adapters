const { sumTokensExport } = require("../helper/unwrapLPs");

const hogGenesisAddress = '0x2e585b96a2ef1661508110e41c005be86b63fc34'
const rewardPoolAddress = '0xa7141905e2972c295577882552bede5406daf5ec'
const masonryAddress = "0xf156C473F4423B7013C612Da0ACD9DDcC33DB3EA"
const ghogToken = "0x0e899dA2aD0817ed850ce68f7f489688E4D42D9D"

const genesisTokens = [
  "0xb1e25689d55734fd3fffc939c4c3eb52dff8a794",  // OS 19% 
  "0x79bbf4508b1391af3a0f4b30bb5fc4aa9ab0e07c",  // Anon 10% 
  "0x44e23b1f3f4511b3a7e81077fd9f2858df1b7579",  // Mclb 9% 
  "0xa04bc7140c26fc9bb1f36b1a604c7a5a88fb0e70",  // SWPx 11% 
  "0xe5da20f15420ad15de0fa650600afc998bbe3955",  // stS 7% 
  "0xd3dce716f3ef535c5ff8d041c1a41c3bd89b97ae",  // scUSD 7% 
  "0x4eec869d847a6d13b0f6d1733c5dec0d1e741b4f",  // Indi 4% 
  "0x9fdbc3f8abc05fa8f3ad3c17d2f806c1230c4564",  // Goglz 4% 
  "0x2d0e0814e62d80056181f5cd932274405966e4f0",  // Beets 2%
]

module.exports = {
  methodology: "TVL consists of genesis pools plus the balances of HOG-OS LP and GHOG liquidity pool in the reward contract, plus GHOG tokens locked in the masonry",
  sonic: {
    tvl: async (api) => {
      // First get genesis pools TVL
      const genesisTvl = await api.sumTokens({
        tokens: genesisTokens,
        owner: hogGenesisAddress,
      })

      // Then get LP tokens TVL with unwrapping
      const lpTvl = await api.sumTokens({
        tokens: [
          "0x784dd93f3c42dcbf88d45e6ad6d3cc20da169a60", // HOG-OS LP
          "0xd1cb1622a50506f0fddf329cb857a0935c7fbbf9"  // GHOG pool
        ],
        owner: rewardPoolAddress,
        resolveLP: true,
      })

      // Finally get GHOG from masonry
      const masonryTvl = await api.sumTokens({
        tokens: [ghogToken],
        owner: masonryAddress,
      })

      return {
        ...genesisTvl,
        ...lpTvl,
        ...masonryTvl,
      }
    }
  },
};
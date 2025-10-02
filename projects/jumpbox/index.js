const { sumTokens2 } = require('../helper/unwrapLPs')

const JUMPBOX_TOKEN = "0x5B9957A7459347163881d19a87f6DC13291C2B07"
const WRAPPER_STAKING = "0x80d25c6615ba03757619ab427c2d995d8b695162"
const UNISWAP_V3_POOL = "0xe610ddc70eb7f2cff4a18d55b0cf0cef1f6e0f5f"

module.exports = {
  methodology: "TVL is calculated from the value of JUMPBOX-WETH Uniswap V3 liquidity positions held in the Rebase staking wrapper contract. Users stake V3 LP positions and earn 118% APY.",
  
  base: {
    tvl: async (api) => {
      return sumTokens2({
        api,
        owner: WRAPPER_STAKING,
        tokens: [UNISWAP_V3_POOL],
        resolveUniV3: true  // ← THIS IS WHAT THEY WANT
      })
    }
  }
}

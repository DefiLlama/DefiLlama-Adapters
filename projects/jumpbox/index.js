const { sumTokens2 } = require('../helper/unwrapLPs')

module.exports = {
  methodology: "TVL is calculated by tracking JUMPBOX and WETH tokens held in the Rebase staking wrapper contract, which represents the value of Uniswap V3 LP positions staked for High-yield staking (currently ~118% APY).",
  
  base: {
    tvl: async (api) => {
      const WRAPPER = "0x80d25c6615ba03757619ab427c2d995d8b695162"
      const JUMPBOX = "0x5B9957A7459347163881d19a87f6DC13291C2B07"
      const WETH = "0x4200000000000000000000000000000000000006" // Base WETH
      
      return sumTokens2({
        api,
        owner: WRAPPER,
        tokens: [JUMPBOX, WETH]
      })
    }
  }
}

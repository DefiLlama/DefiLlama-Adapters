const { uniTvlExport } = require("../helper/calculateUniTvl")

// const PUNCH_SWAP_V2_ROUTER = "0xf45AFe28fd5519d5f8C1d4787a4D5f724C0eFa4d"
const PUNCH_SWAP_V2_FACTORY = "0x29372c22459a4e373851798bFd6808e71EA34A71"

module.exports = {
  misrepresentedTokens: true,
  methodology: "KittenSwap is a Uniswap V2-like DEX on Flow.",
  flow: {
    tvl: uniTvlExport(PUNCH_SWAP_V2_FACTORY, "flow", true)
  }
}
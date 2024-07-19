const { sumTokensExport} = require("./helper/unknownTokens");

const stakingContract = '0x79bfE41cDbF6b7E949B93B46a2cBEFB497d71c20'
const RARE_WXDAI_LP = '0x5805bb63e73ec272c74e210d280c05b41d719827'

module.exports = {
  xdai: {
    pool2: sumTokensExport({ owner: stakingContract, tokens: [RARE_WXDAI_LP], useDefaultCoreAssets: true, }),
    tvl: () => ({}), 
  },
  methodology: `RARE/WXDAI LP on Honeyswap can be staked in a pool2 contract`
}

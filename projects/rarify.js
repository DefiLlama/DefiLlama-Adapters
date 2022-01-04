const { sumLPWithOnlyOneTokenOtherThanKnown} = require("./helper/unwrapLPs");

const stakingContract = '0x79bfE41cDbF6b7E949B93B46a2cBEFB497d71c20'
const RARE_WXDAI_LP = '0x5805bb63e73ec272c74e210d280c05b41d719827'
const RARE = '0x57e93bb58268de818b42e3795c97bad58afcd3fe'

// Since RARE-Coin is not listed yet on coingecko for pricing data, use sumLPWithOnlyOneTokenOtherThanKnown
// When listed on coingecko, could be simply pool2:pool2(stakingContract, RARE_WXDAI_LP, "xdai", t => `xdai:${t}`)
async function pool2(timestamp, ethBlock, chainBlocks) {
  const balances = {}
  await sumLPWithOnlyOneTokenOtherThanKnown(balances, RARE_WXDAI_LP, stakingContract, RARE, chainBlocks['xdai'], 'xdai', t => `xdai:${t}`)
  return balances
}

module.exports = {
  xdai: {
    pool2,
    tvl: () => ({}), 
  },
  methodology: `RARE/WXDAI LP on Honeyswap can be staked in a pool2 contract`
}

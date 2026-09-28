const { uniV3Export } = require('../helper/uniswapV3');
const { mergeExports } = require('../helper/utils');

const exportStandardPoolTVL = uniV3Export({
  robinhood: { factory: '0xf03875b5Ec5eAc83cab83A6c2ab17844304AA7a0', fromBlock: 54162498, isAlgebra: true, extraKey:'standard-pool'}, // For standard pools
  hyperliquid: { factory: '0x5f95E92c338e6453111Fc55ee66D4AafccE661A7', fromBlock: 11022081, isAlgebra: true , extraKey:'standard-pool', blacklistedTokens: ['0x1d25eeeee9b61fe86cff35b0855a0c5ac20a5feb']}, // For standard pools
})

const exportCustomPoolTVL = uniV3Export({
  robinhood: { factory: '0xf03875b5Ec5eAc83cab83A6c2ab17844304AA7a0', fromBlock: 54162498, isAlgebra: true , isCustom: true, extraKey:'custom-pool'}, // For custom pools
  hyperliquid: { factory: '0x5f95E92c338e6453111Fc55ee66D4AafccE661A7', fromBlock: 11022081, isAlgebra: true , isCustom: true, extraKey:'custom-pool', blacklistedTokens: ['0x1d25eeeee9b61fe86cff35b0855a0c5ac20a5feb']} // For custom pools
})


module.exports = mergeExports([exportStandardPoolTVL , exportCustomPoolTVL])

const { uniV3Export } = require('../helper/uniswapV3')
const { mergeExports } = require('../helper/utils');

const export1 = uniV3Export({
  arbitrum: { factory: '0xd490f2f6990c0291597fd1247651b4e0dcf684dd', fromBlock: 75633510, isAlgebra: true, },
})

const export2 = uniV3Export({
  arbitrum: { factory: '0x1a3c9B1d2F0529D97f2afC5136Cc23e58f1FD35B', fromBlock: 75633510, isAlgebra: true, },
})

module.exports = mergeExports([export1, export2]);
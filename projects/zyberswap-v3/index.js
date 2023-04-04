const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  arbitrum: {
    factory: '0x9c2abd632771b433e5e7507bcaa41ca3b25d8544',
    fromBlock: 62714800,
    isAlgebra: true,
  }
})

const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  hyperliquid: {
    factory: '0xf77bd082c627aa54591cf2f2eaa811fd1ab3b1f3',
    fromBlock: 33000000,
    isAlgebra: true,
    permitFailure: true,
  },
})

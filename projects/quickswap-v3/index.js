const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  polygon: {
    factory: '0x411b0facc3489691f28ad58c47006af5e3ab3a28',
    fromBlock: 32611263,
    isAlgebra: true,
    permitFailure: true,
    sumChunkSize: 50,
  },
})

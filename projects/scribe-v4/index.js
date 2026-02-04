const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  scroll: {
    factory: '0xDc62aCDF75cc7EA4D93C69B2866d9642E79d5e2e',
    fromBlock: 7680915,
    isAlgebra: true,
  },
})

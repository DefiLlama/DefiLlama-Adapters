const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  mode: {
    factory: '0xB5F00c2C5f8821155D8ed27E31932CFD9DB3C5D5',
    fromBlock: 4823915,
    isAlgebra: true,
  },
  base: {
    factory: '0x2F0d41f94d5D1550b79A83D2fe85C82d68c5a3ca',
    fromBlock: 15395969,
    isAlgebra: true,
  },
})

const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  base: {
    factory: '0xC5396866754799B9720125B104AE01d935Ab9C7b',
    isAlgebra: true,
    fromBlock: 30736835,
  },
  soneium: {
    factory: '0x8Ff309F68F6Caf77a78E9C20d2Af7Ed4bE2D7093',
    isAlgebra: true,
    fromBlock: 1681559,
  },
  xlayer: {
    factory: '0x0284d1a8336E08AE0D3e30e7B0689Fa5B68E6310',
    isAlgebra: true,
    fromBlock: 3073933,
  },
})
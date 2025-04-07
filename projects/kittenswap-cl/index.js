const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  hyperliquid: { 
    factory: '0x2E08F5Ff603E4343864B14599CAeDb19918BDCaF', 
    fromBlock: 1, 
  },
})
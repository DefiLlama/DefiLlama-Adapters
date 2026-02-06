const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  hyperliquid: { 
    factory: '0x40059A6F242C3de0E639693973004921B04D96AD', 
    fromBlock: 592235,
    blacklistedTokens: ['0x1d25eeeee9b61fe86cff35b0855a0c5ac20a5feb']
  },
})
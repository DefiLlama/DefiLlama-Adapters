const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  fantom: { factory: '0x7Ca1dCCFB4f49564b8f13E18a67747fd428F1C40', fromBlock: 100367164 },
  base:   { factory: '0x7Ca1dCCFB4f49564b8f13E18a67747fd428F1C40', fromBlock:  23864326 },
  sonic:  { factory: '0x7Ca1dCCFB4f49564b8f13E18a67747fd428F1C40', fromBlock:    548461 },
})

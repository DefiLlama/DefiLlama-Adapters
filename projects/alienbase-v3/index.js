const { uniV3Export } = require('../helper/uniswapV3')
const factory = '0x0Fd83557b2be93617c9C1C1B6fd549401C74558C'

module.exports = uniV3Export({
  base: { factory, fromBlock: 7150708, permitFailure: true },
})

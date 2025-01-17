const { uniV3Export } = require('../helper/uniswapV3')
const factory = '0xA51136931fdd3875902618bF6B3abe38Ab2D703b'

module.exports = uniV3Export({
  sei: { factory, fromBlock: 126356000, },
})
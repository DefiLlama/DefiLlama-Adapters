const { uniV3Export } = require('../helper/uniswapV3')
const factory = '0x4bC187E010A0732A4299cc8Bc9f6e889795eBc06'

module.exports = uniV3Export({
  eon: { factory, fromBlock: 547034, },
})

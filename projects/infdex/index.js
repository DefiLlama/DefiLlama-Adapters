const { uniV3Export } = require('../helper/uniswapV3')
const factory = '0x6701E10b02F4131003510f95419F4EeA59484007'

module.exports = uniV3Export({
  merlin: { factory, fromBlock: 12099773, }
})
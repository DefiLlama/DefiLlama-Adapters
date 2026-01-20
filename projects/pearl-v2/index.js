const { uniV3Export } = require('../helper/uniswapV3')
const { staking } = require('../helper/staking')

module.exports = uniV3Export({
  'real': { factory: '0xeF0b0a33815146b599A8D4d3215B18447F2A8101', fromBlock: 33062, },
})

module.exports.real.staking = staking('0x7f8F92C2446E044af45DCf15476Bc931Fd1d0020', '0xB08F026f8a096E6d92eb5BcbE102c273A7a2d51C')
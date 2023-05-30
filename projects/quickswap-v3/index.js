const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniV3Export({
  polygon: { factory: '0x411b0facc3489691f28ad58c47006af5e3ab3a28', fromBlock: 32610688, isAlgebra: true, },
  dogechain: { factory: '0xd2480162aa7f02ead7bf4c127465446150d58452', fromBlock: 837574, isAlgebra: true, },
  polygon_zkevm: { factory: '0x4B9f4d2435Ef65559567e5DbFC1BbB37abC43B57', fromBlock: 300, isAlgebra: true, },
})
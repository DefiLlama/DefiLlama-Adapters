const { uniV3Export } = require('../helper/uniswapV3')
const factory = '0x009c4ef7C0e0Dd6bd1ea28417c01Ea16341367c3'

module.exports = uniV3Export({
    bsc: { factory, fromBlock: 34184408 }
})

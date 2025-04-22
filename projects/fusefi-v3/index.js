const { uniV3Export } = require('../helper/uniswapV3')
const factory = '0xaD079548b3501C5F218c638A02aB18187F62b207'

module.exports = uniV3Export({
    fuse: { factory, fromBlock: 27175571 }
})

const { uniV3Export } = require('../helper/uniswapV3')
const factory = '0x6E36FC34eA123044F278d3a9F3819027B21c9c32'

module.exports = uniV3Export({
  mode: { factory, fromBlock: 5005167 },
})
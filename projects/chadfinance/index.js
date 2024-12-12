const { uniV3Export } = require('../helper/uniswapV3')

const factory = '0x0DF45d6e3BC41fd8e50d9e227215413053c003Ad' // same on all chains

module.exports = uniV3Export({
  scroll: { factory, fromBlock: 5288937, }
})
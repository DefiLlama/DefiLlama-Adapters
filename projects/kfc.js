const { uniV3Export } = require("./helper/uniswapV3")

const factory = '0x09df701f1f5df83a3bbef7da4e74bb075199d6a4' // same on all chains

module.exports = uniV3Export({
  kasplex: { factory, fromBlock: 484634, }
})// test change

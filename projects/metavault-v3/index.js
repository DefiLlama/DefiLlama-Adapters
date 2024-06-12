const { uniV3Export } = require("../helper/uniswapV3")

const factory = "0x9367c561915f9D062aFE3b57B18e30dEC62b8488" // same on all chains

module.exports = uniV3Export({
  linea: { factory, fromBlock: 652486, },
  scroll: { factory, fromBlock: 77008, blacklistedTokens: ['0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f'] },
})
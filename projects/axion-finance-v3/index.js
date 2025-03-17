const { uniV3Export } = require("../helper/uniswapV3")
const { mergeExports } = require("../helper/utils")

const uniV3Tvl = uniV3Export({
  taiko: { factory: '0x0526521166748a61A6fd24effa48FEF98F34b9e4', fromBlock: 868506 }
})

module.exports = mergeExports([uniV3Tvl])
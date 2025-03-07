const { uniV3Export } = require("../helper/uniswapV3")
const { uniTvlExport } = require("../helper/unknownTokens")
const { mergeExports } = require("../helper/utils")

const uniV3Tvl = uniV3Export({
  taiko: { factory: '0x0526521166748a61A6fd24effa48FEF98F34b9e4', fromBlock: 868506 }
})
const uniV2Tvl = uniTvlExport('taiko', '0x8a8865fa5fB7C8360E5a6d8Aa27F7Ca1b9E55443')


module.exports = mergeExports([uniV3Tvl, uniV2Tvl])
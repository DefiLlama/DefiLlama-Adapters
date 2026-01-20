const { uniTvlExport } = require("../helper/unknownTokens")
const { mergeExports } = require("../helper/utils")

const uniV2Tvl = uniTvlExport('taiko', '0x8a8865fa5fB7C8360E5a6d8Aa27F7Ca1b9E55443')

module.exports = mergeExports([uniV2Tvl])
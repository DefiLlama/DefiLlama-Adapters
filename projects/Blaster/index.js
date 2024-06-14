const { uniV3Export } = require("../helper/uniswapV3");
const { mergeExports } = require('../helper/utils')

module.exports = mergeExports([
  uniV3Export({ blast: { factory: "0x9792FaeA53Af241bCE57C7C8D6622d5DaAD0D4Fc", fromBlock: 693561, }, }),
])

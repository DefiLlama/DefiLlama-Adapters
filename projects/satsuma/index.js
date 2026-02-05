const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  citrea: { 
    factory: "0x10253594A832f967994b44f33411940533302ACb", 
    fromBlock: 100000,
    isAlgebra: true,  // Required for Algebra-based DEXes
  },
})

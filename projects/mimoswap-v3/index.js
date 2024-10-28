const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  iotex: { factory: "0xF36788bF206f75F29f99Aa9d418fD8164b3B8198", fromBlock: 27707694, blacklistedTokens: ['0x95cb18889b968ababb9104f30af5b310bd007fd8'] }
})
const { uniV3Export } = require("../helper/uniswapV3");
const factory = "0x62B672E531f8c11391019F6fba0b8B6143504169";
module.exports = uniV3Export({
  avax: {
    factory,
    fromBlock: 36560289,
  },
});

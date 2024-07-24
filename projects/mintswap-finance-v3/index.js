const { uniV3Export } = require("../helper/uniswapV3");

const factory = "0x1f88BB455E02646224A0a65f3eb4B2FCb4fb8e49";

module.exports = uniV3Export({
  mint: { factory, fromBlock: 1025232 },
})
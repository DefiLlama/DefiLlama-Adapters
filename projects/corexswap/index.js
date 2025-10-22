const { uniV3Export } = require("../helper/uniswapV3");
const factory = "0x526190295AFB6b8736B14E4b42744FBd95203A3a";

module.exports = uniV3Export({
  core: { factory, fromBlock: 14045524 },
});
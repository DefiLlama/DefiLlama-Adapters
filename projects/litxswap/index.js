const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  pulse: {
    factory: "0x24398b6ea5434339934D999E431807B1C157b4Fd",
    fromBlock: 17449439,
    isAlgebra: true,
  },
  bsc: {
    factory: "0xbbc7f5605c9cb341d9c41e46ae6ceb30511bdfcf",
    fromBlock: 29291639,
    isAlgebra: true,
  },
});

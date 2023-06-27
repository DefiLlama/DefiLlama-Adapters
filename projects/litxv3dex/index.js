const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  pulse: {
    factory: "0x24398b6ea5434339934D999E431807B1C157b4Fd",
    fromBlock: 17449439,
    isAlgebra: true,
  },
  bsc: {
    factory: "0xaA37Bea711D585478E1c04b04707cCb0f10D762a",
    fromBlock: 28719189,
    isAlgebra: true,
  },
});

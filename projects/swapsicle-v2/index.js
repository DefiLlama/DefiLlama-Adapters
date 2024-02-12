const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  mantle: {
    factory: "0xC848bc597903B4200b9427a3d7F61e3FF0553913",
    fromBlock: 9796947,
    isAlgebra: true,
  },
  telos: {
    factory: "0xA09BAbf9A48003ae9b9333966a8Bda94d820D0d9",
    fromBlock: 301362984,
    isAlgebra: true,
  },
});

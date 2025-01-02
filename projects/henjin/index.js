const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  taiko: {
    factory: "0x42B08e7a9211482d3643a126a7dF1895448d3509",
    fromBlock: 400,
    isAlgebra: true,
  },
});

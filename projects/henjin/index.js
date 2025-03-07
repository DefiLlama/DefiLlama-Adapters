const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  taiko: {
    factory: "0x42B08e7a9211482d3643a126a7dF1895448d3509",
    fromBlock: 400,
    isAlgebra: true,
  },
  base: {
    factory: "0x4963818c35d5793D771bf8091c750b5A71eD101b",
    fromBlock: 24813689,
    isAlgebra: true,
  },
});

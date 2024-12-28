const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  moonbeam: {
    factory: "0xabe1655110112d0e45ef91e94f8d757e4ddba59c",
    fromBlock: 2649801,
    isAlgebra: true,
    permitFailure: true,
  },
});

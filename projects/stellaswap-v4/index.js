const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  moonbeam: {
    factory: "0x90dD87C994959A36d725bB98F9008B0b3C3504A0",
    fromBlock: 9521226,
    isAlgebra: true,
    permitFailure: true,
  },
});

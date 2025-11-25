const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  monad: {
    factory: "0x05aA1d36F78D1242C40b3680d38EB1feE7060c20",
    fromBlock: 31728497,
    isAlgebra: true,
    permitFailure: true,
  },
});

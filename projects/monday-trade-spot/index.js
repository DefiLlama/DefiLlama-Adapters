const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  monad: {
    factory: "0xc1e98d0a2a58fb8abd10ccc30a58efff4080aa21",
    fromBlock: 35093818,
    permitFailure: true, // there are some bad tokens
  },
});
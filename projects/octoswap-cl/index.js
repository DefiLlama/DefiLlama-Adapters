const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  monad: {
    factory: "0x30Db57A29ACf3641dfc3885AF2e5f1F5A408D9CB",
    fromBlock:33818287,
    permitFailure: true, // there are some bad tokens
  },
});
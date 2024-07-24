const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  kava: {
    factory: "0x2dBB6254231C5569B6A4313c6C1F5Fe1340b35C2",
    fromBlock: 6069472,
  },
  base: {
    factory: "0xdDF5a3259a88Ab79D5530eB3eB14c1C92CD97FCf",
    fromBlock: 14195510,
  },
});

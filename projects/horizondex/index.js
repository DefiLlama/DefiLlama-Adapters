const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  linea: {
    factory: "0x9Fe607e5dCd0Ea318dBB4D8a7B04fa553d6cB2c5",
    fromBlock: 1150,
  },
  base: {
    factory: "0x07AceD5690e09935b1c0e6E88B772d9440F64718",
    fromBlock: 2053334,
  },
});

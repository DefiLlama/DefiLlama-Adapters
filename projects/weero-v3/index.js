const { uniV3Export } = require("../helper/uniswapV3");
const factory = "0x6603E53b4Ae1AdB1755bAF62BcbF206f90874178";

module.exports = uniV3Export({
  klaytn: { factory, fromBlock: 186673202 },
});

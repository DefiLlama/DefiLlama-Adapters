const { uniV3Export } = require("../helper/uniswapV3");
const factory = "0x7431A23897ecA6913D5c81666345D39F27d946A4";

module.exports = uniV3Export({
  klaytn: { factory, fromBlock: 145316715 },
});

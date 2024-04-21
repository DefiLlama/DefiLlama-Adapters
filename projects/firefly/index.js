const sdk = require("@defillama/sdk");
const { uniV3Export } = require("../helper/uniswapV3");
const { mergeExports } = require("../helper/utils");

module.exports = mergeExports([
  uniV3Export({
    manta: {
      factory: "0x8666EF9DC0cA5336147f1B11f2C4fC2ecA809B95",
      fromBlock: 1776716,
    },
  }),
]);

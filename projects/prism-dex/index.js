const { uniV3Export } = require("../helper/uniswapV3");

module.exports = {
  methodology: "Counts TVL from all Uniswap V3 pools deployed via the factory contract at 0x1adb8f973373505bb206e0e5d87af8fb1f5514ef",
  start: 7845865,
  ...uniV3Export({
    megaeth: {
      factory: "0x1adb8f973373505bb206e0e5d87af8fb1f5514ef",
      fromBlock: 7845865,
    },
  })
};

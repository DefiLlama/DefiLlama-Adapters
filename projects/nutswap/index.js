const { uniV3Export } = require("../helper/uniswapV3");

module.exports = uniV3Export({
  dscs: {
    factory: "0x5fb86b37567Bd3D341d1a3B2d7F4b4C2Ce085991",
    fromBlock: 677165,
    permitFailure: true,
  },
});

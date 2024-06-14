const { uniV3Export } = require("../helper/uniswapV3");
const factory = "0x9BD425a416A276C72a13c13bBd8145272680Cf07";

module.exports = uniV3Export({
  linea: { factory, fromBlock: 2388856 },
});

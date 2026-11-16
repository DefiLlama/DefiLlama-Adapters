const { aaveV3Export } = require("../helper/aave");

/* LayerBank V3 */

const v3Config = {
  rsk: ['0x47C1ef207d49cfC519F48b8251857CA6BE6c2caf'],
  robinhood: ['0x7ED03A856D52172f9501aB0176f184baD287e546'],
};

module.exports = aaveV3Export(v3Config);

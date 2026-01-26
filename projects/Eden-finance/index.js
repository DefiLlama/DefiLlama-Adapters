const CONFIG = {
  assetchain: ['0x1d0c5587b05D2FBE944c118d581C3102E06D1726']
};

const { aaveV3Export } = require("../helper/aave");

module.exports = aaveV3Export(CONFIG)

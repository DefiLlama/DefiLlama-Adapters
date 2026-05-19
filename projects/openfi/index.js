const { aaveV3Export } = require("../helper/aave");

const CONFIG = {
  pharos: {
    poolDatas: ['0x3EF4724f0f2fabfA0ba96AfC711D64e6BE3367Fb'],
  },
};

module.exports = aaveV3Export(CONFIG);

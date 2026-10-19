const { aaveV3Export } = require("../helper/aave");

const CONFIG = {
  pharos: {
    poolDatas: ['0x3EF4724f0f2fabfA0ba96AfC711D64e6BE3367Fb'],
  },
  bsc: {
    poolDatas: ['0xeFD74781D9C468FFE6a4d8CA7720E8EF0223744E'],
  },
};

module.exports = aaveV3Export(CONFIG);

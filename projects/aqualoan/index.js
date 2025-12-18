const CONFIG = {
  bsc: ['0xDc33eAA50B8707f791478Cec324e451E20FDa7ed']
};
const { aaveV3Export } = require("../helper/aave");

module.exports = aaveV3Export(CONFIG)

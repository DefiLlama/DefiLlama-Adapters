const { aaveExports } = require("../helper/aave");
const methodologies = require("../helper/methodologies");

module.exports = {
  methodology: methodologies.lendingMarket,
  bsc: aaveExports('bsc', '0x37D7Eb561E189895E5c8601Cd03EEAB67C269189', undefined, ['0x09ddc4ae826601b0f9671b9edffdf75e7e6f5d61'], { v3: true, }),
  op_bnb: aaveExports('op_bnb', '0x37D7Eb561E189895E5c8601Cd03EEAB67C269189', undefined, ['0xBb5f2d30c0fC9B0f71f7B19DaF19e7Cf3D23eb5E'], { v3: true, }),
};

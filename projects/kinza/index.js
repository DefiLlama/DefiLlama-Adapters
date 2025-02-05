const { aaveExports } = require("../helper/aave");
const methodologies = require("../helper/methodologies");

module.exports = {
  methodology: methodologies.lendingMarket,
  bsc: aaveExports('bsc', '0x37D7Eb561E189895E5c8601Cd03EEAB67C269189', undefined, ['0x09ddc4ae826601b0f9671b9edffdf75e7e6f5d61'], { v3: true, }),
  op_bnb: aaveExports('op_bnb', '0xcf46F77cD75a17900d59676fBe4B88aAdcBA9533', undefined, ['0xBb5f2d30c0fC9B0f71f7B19DaF19e7Cf3D23eb5E'], { v3: true, }),
  mantle: aaveExports('mantle', '0xad48812a9d81aCf8De5bfc93c7d6d7165920aBc2', undefined, ['0x18cc2c55b429EE08748951bBD33FF2e68c95ec38'], { v3: true, }),
  ethereum: aaveExports('ethereum', '0x37c9E6eEAbE799878FF9d32984A3a0b91243cbC6', undefined, ['0xE44990a8a732605Eddc0870597d2Cf4A2637F038'], { v3: true, }),
};

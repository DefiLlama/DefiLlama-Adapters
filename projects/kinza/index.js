const { aaveExports } = require("../helper/aave");

module.exports = {
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending",
  bsc: {
    ...aaveExports('bsc', '0x37D7Eb561E189895E5c8601Cd03EEAB67C269189'),
  },
  opbnb: {
    ...aaveExports('opbnb', '0xcf46F77cD75a17900d59676fBe4B88aAdcBA9533'),
  },
  mantle: {
    ...aaveExports('mantle', '0xad48812a9d81aCf8De5bfc93c7d6d7165920aBc2'),
  },
  ethereum: {
    ...aaveExports('ethereum', '0x37c9E6eEAbE799878FF9d32984A3a0b91243cbC6'),
  },
};

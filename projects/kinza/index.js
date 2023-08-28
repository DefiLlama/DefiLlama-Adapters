const { aaveExports } = require("../helper/aave");

module.exports = {
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending",
  bsc: {
    ...aaveExports('bsc', '0x37D7Eb561E189895E5c8601Cd03EEAB67C269189', undefined, ['0x09ddc4ae826601b0f9671b9edffdf75e7e6f5d61'], {
      v3: true,
    }),
  },
};

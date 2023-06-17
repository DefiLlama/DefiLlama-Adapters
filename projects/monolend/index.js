const { aaveExports } = require("../helper/aave");

module.exports = {
  methodology: "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There are multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending.",
  polygon: aaveExports('polygon', '0x49Ce0308F3F55955D224453aECe7610b6983c123'),
};

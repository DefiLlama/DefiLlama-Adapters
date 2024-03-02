const { aaveExports } = require("../helper/aave");

module.exports = {
  methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending`,
  xdai: aaveExports('xdai', '0x11B45acC19656c6C52f93d8034912083AC7Dd756', undefined, ["0x11B45acC19656c6C52f93d8034912083AC7Dd756"],),
};

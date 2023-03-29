const { aaveExports } = require("../helper/aave");

module.exports = {
  timetravel: true,
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending",
  klaytn: aaveExports('klaytn', '0x969E4A05c2F3F3029048e7943274eC2E762497AB'),
}

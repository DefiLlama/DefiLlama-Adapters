const { aaveExports } = require("../helper/aave");

module.exports = {
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending",
  arbitrum: aaveExports('arbitrum', '0x9D36DCe6c66E3c206526f5D7B3308fFF16c1aa5E'),
};

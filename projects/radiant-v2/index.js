const { staking } = require("../helper/staking");
const { aaveExports } = require("../helper/aave");

module.exports = {
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending",
  arbitrum: {
    ...aaveExports('arbitrum', '0x9D36DCe6c66E3c206526f5D7B3308fFF16c1aa5E'),
    // balancer pool is not unwrapped properly, so we use staking and rely on price api instead
    pool2: staking("0x76ba3eC5f5adBf1C58c91e86502232317EeA72dE", "0x32df62dc3aed2cd6224193052ce665dc18165841", "arbitrum"),
  }
};

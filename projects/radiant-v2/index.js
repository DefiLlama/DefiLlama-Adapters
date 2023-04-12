const { staking } = require("../helper/staking");
const { sumTokensExport } = require("../helper/unknownTokens");
const { aaveExports } = require("../helper/aave");

module.exports = {
  methodology:
    "Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL, so only the coins actually locked in the contracts are counted. There's multiple reasons behind this but one of the main ones is to avoid inflating the TVL through cycled lending",
  arbitrum: {
    ...aaveExports('arbitrum', '0x9D36DCe6c66E3c206526f5D7B3308fFF16c1aa5E'),
    // balancer pool is not unwrapped properly, so we use staking and rely on price api instead
    pool2: staking("0x76ba3eC5f5adBf1C58c91e86502232317EeA72dE", "0x32df62dc3aed2cd6224193052ce665dc18165841"),
  },
  bsc: {
    ...aaveExports('bsc', '0x16Cd518fE9db541feA810b3091fBee6829a9B0Ce'),
    // balancer pool is not unwrapped properly, so we use staking and rely on price api instead
    pool2: sumTokensExport({ owner: '0x4fd9f7c5ca0829a656561486bada018505dfcb5e', tokens: ['0x346575fc7f07e6994d76199e41d13dc1575322e1'], useDefaultCoreAssets: true, })
  },
};

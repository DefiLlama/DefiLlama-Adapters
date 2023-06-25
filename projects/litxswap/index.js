const { getUniTVL } = require("../helper/unknownTokens");
module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Factory address (0x24398b6ea5434339934D999E431807B1C157b4Fd) is used to find the LP pairs. TVL is equal to the liquidity on the AMM. Staking balance is equal to the balance of $EAZY in $xEAZY contract",
  pulse: {
    tvl: getUniTVL({
      factory: "0x24398b6ea5434339934D999E431807B1C157b4Fd",
      useDefaultCoreAssets: true,
    }),
  },
};
